const User = require('../models/User');
const Project = require('../models/Project');
const { Chat, Message } = require('../models/Chat');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

module.exports = (io) => {
  // Authentication middleware for Socket.IO
  const authenticateSocket = async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId).select('-password -otp');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  };

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Update user status to online
    User.findByIdAndUpdate(socket.userId, {
      status: 'online',
      lastSeen: new Date()
    }).exec();

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle joining a project
    socket.on('join-project', async (projectId) => {
      try {
        const project = await Project.findById(projectId);
        if (!project) {
          socket.emit('error', { message: 'Project not found' });
          return;
        }

        // Check if user has access
        const hasAccess = project.owner.toString() === socket.userId ||
                         project.collaborators.some(c => c.user.toString() === socket.userId);

        if (!hasAccess && !project.isPublic) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Join project room
        socket.join(`project:${projectId}`);

        // Add user to active users
        const existingUser = project.activeUsers.find(
          u => u.user.toString() === socket.userId
        );

        if (!existingUser) {
          project.activeUsers.push({
            user: socket.userId,
            socketId: socket.id,
            cursor: { line: 1, column: 1 }
          });
        } else {
          existingUser.socketId = socket.id;
          existingUser.lastActivity = new Date();
        }

        await project.save();
        await project.populate('activeUsers.user', 'username fullName avatar');

        // Notify others in project
        socket.to(`project:${projectId}`).emit('user-joined', {
          user: socket.user,
          activeUsers: project.activeUsers
        });

        // Send project data to user
        socket.emit('project-joined', {
          project: project,
          activeUsers: project.activeUsers
        });

      } catch (error) {
        console.error('Join project error:', error);
        socket.emit('error', { message: 'Failed to join project' });
      }
    });

    // Handle leaving a project
    socket.on('leave-project', async (projectId) => {
      try {
        const project = await Project.findById(projectId);
        if (project) {
          project.activeUsers = project.activeUsers.filter(
            u => u.user.toString() !== socket.userId
          );
          await project.save();

          socket.leave(`project:${projectId}`);
          socket.to(`project:${projectId}`).emit('user-left', {
            userId: socket.userId,
            username: socket.user.username
          });
        }
      } catch (error) {
        console.error('Leave project error:', error);
      }
    });

    // Handle code changes
    socket.on('code-change', async (data) => {
      try {
        const { projectId, fileId, operation, content } = data;
        
        // Broadcast to other users in project
        socket.to(`project:${projectId}`).emit('code-change', {
          fileId,
          operation,
          content,
          userId: socket.userId,
          username: socket.user.username
        });

        // Update project in database (debounced)
        const project = await Project.findById(projectId);
        if (project) {
          const file = project.files.id(fileId);
          if (file) {
            file.content = content;
            await project.save();
          }
        }
      } catch (error) {
        console.error('Code change error:', error);
      }
    });

    // Handle cursor position
    socket.on('cursor-position', async (data) => {
      try {
        const { projectId, fileId, line, column } = data;
        
        // Update cursor position in project
        const project = await Project.findById(projectId);
        if (project) {
          const activeUser = project.activeUsers.find(
            u => u.user.toString() === socket.userId
          );
          if (activeUser) {
            activeUser.cursor = { line, column };
            activeUser.lastActivity = new Date();
            await project.save();
          }
        }

        // Broadcast to other users
        socket.to(`project:${projectId}`).emit('cursor-position', {
          userId: socket.userId,
          username: socket.user.username,
          fileId,
          line,
          column
        });
      } catch (error) {
        console.error('Cursor position error:', error);
      }
    });

    // Handle AI chat
    socket.on('ai-chat', async (data) => {
      try {
        const { message, code, language } = data;
        
        let prompt = `You are a helpful AI coding assistant. The user is working with ${language || 'javascript'} code.\
\
`;
        
        if (code) {
          prompt += `Current code:\
\`\`\`${language || 'javascript'}\
${code}\
\`\`\`\
\
`;
        }
        
        prompt += `User question: ${message}\
\
Provide a helpful, detailed response with code examples if relevant.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful AI coding assistant." },
            { role: "user", content: prompt }
          ],
          max_tokens: 500,
          temperature: 0.7
        });

        const aiResponse = completion.choices[0].message.content;
        
        socket.emit('ai-response', {
          message: aiResponse,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('AI chat error:', error);
        socket.emit('ai-response', {
          message: 'Sorry, I encountered an error. Please try again.',
          error: true
        });
      }
    });

    // Handle personal chat
    socket.on('send-message', async (data) => {
      try {
        const { chatId, content, type, metadata } = data;
        
        const message = new Message({
          sender: socket.userId,
          content,
          type: type || 'text',
          metadata,
          chat: chatId
        });

        await message.save();

        // Update chat
        const chat = await Chat.findById(chatId);
        if (chat) {
          chat.lastMessage = message._id;
          chat.updatedAt = new Date();

          // Update unread counts
          chat.participants.forEach(participantId => {
            if (participantId.toString() !== socket.userId) {
              const currentCount = chat.getUnreadCount(participantId);
              chat.unreadCount.set(participantId.toString(), currentCount + 1);
              
              // Send to recipient's personal room
              socket.to(`user:${participantId}`).emit('new-message', {
                chatId,
                message
              });
            }
          });

          await chat.save();
        }

        await message.populate('sender', 'username fullName avatar');
        
        // Send confirmation to sender
        socket.emit('message-sent', {
          chatId,
          message
        });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', async (data) => {
      try {
        const { chatId } = data;
        
        socket.to(`user:${chatId}`).emit('user-typing', {
          userId: socket.userId,
          username: socket.user.username
        });

      } catch (error) {
        console.error('Typing error:', error);
      }
    });

    // Handle WebRTC signaling for video calls
    socket.on('video-call-offer', (data) => {
      const { targetUserId, offer } = data;
      socket.to(`user:${targetUserId}`).emit('video-call-offer', {
        fromUserId: socket.userId,
        fromUsername: socket.user.username,
        offer
      });
    });

    socket.on('video-call-answer', (data) => {
      const { targetUserId, answer } = data;
      socket.to(`user:${targetUserId}`).emit('video-call-answer', {
        fromUserId: socket.userId,
        answer
      });
    });

    socket.on('ice-candidate', (data) => {
      const { targetUserId, candidate } = data;
      socket.to(`user:${targetUserId}`).emit('ice-candidate', {
        fromUserId: socket.userId,
        candidate
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.username} disconnected`);

      // Update user status to offline
      await User.findByIdAndUpdate(socket.userId, {
        status: 'offline',
        lastSeen: new Date()
      }).exec();

      // Remove from active projects
      const projects = await Project.find({
        'activeUsers.user': socket.userId
      });

      for (const project of projects) {
        project.activeUsers = project.activeUsers.filter(
          u => u.user.toString() !== socket.userId
        );
        await project.save();

        socket.to(`project:${project._id}`).emit('user-left', {
          userId: socket.userId,
          username: socket.user.username
        });
      }
    });
  });
};



