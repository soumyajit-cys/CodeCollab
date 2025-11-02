# CodeCollab - Real-time Collaborative Code Editor with AI Assistant

A modern, full-stack web application that enables multiple developers to collaborate on code in real-time, featuring an integrated AI assistant for code completion, debugging, and optimization.

## 🚀 Features

### Authentication System
- **Phone Number Verification**: Secure signup with OTP verification via SMS
- **Email Confirmation**: Automatic email with login credentials after registration
- **JWT Authentication**: Secure token-based authentication system
- **User Management**: Complete profile management with status indicators

### Real-time Code Editor
- **Monaco Editor Integration**: VS Code-like editing experience
- **Multi-language Support**: JavaScript, Python, Java, C++, HTML, CSS, TypeScript, and more
- **Real-time Collaboration**: Live code synchronization across multiple users
- **Operational Transformation**: Conflict resolution for simultaneous editing
- **File Management**: Create, edit, and organize project files

### AI Assistant
- **OpenAI Integration**: Powered by GPT-3.5 for intelligent code assistance
- **Code Analysis**: Debugging help and optimization suggestions
- **Context-aware Responses**: AI understands your current code context
- **Chat Interface**: Natural language interaction with AI assistant

### Communication Features
- **Personal Chat**: Direct messaging between users
- **Team Chat**: Project-specific chat rooms
- **Typing Indicators**: Real-time presence awareness
- **Message History**: Persistent chat storage

### Video Conferencing
- **WebRTC Technology**: Peer-to-peer video calling
- **Screen Sharing**: Share your screen with collaborators
- **Google Meet-like Experience**: Professional video conferencing interface
- **Audio/Video Controls**: Full control over media streams

### Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Themes**: Toggle between color schemes
- **Smooth Animations**: Fluid transitions and micro-interactions
- **Intuitive Interface**: Clean, user-friendly design

## 🛠 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication
- **Twilio** - SMS service for OTP
- **Nodemailer** - Email service
- **OpenAI** - AI integration

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Monaco Editor** - Code editor
- **Socket.IO Client** - Real-time communication
- **Framer Motion** - Animation library
- **React Router** - Client-side routing

### Additional Technologies
- **WebRTC** - Video conferencing
- **Simple Peer** - WebRTC wrapper
- **Axios** - HTTP client
- **React Hot Toast** - Notification system

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 4.4+
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/codecollab.git
cd codecollab
```

### 2. Install Dependencies
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `EMAIL_USER` & `EMAIL_PASS` - Gmail credentials for email service
- `TWILIO_ACCOUNT_SID` & `TWILIO_AUTH_TOKEN` - Twilio credentials for SMS
- `OPENAI_API_KEY` - OpenAI API key for AI assistant

### 4. Start MongoDB
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu
sudo systemctl start mongod

# On Windows
net start MongoDB
```

### 5. Run the Application
```bash
# Development mode (runs both server and client)
npm run dev

# Or run separately:
npm run server  # Server on port 3001
npm run client  # Client on port 5173
```

### 6. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## 📁 Project Structure

```
codecollab/
├── server/                 # Backend application
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── sockets/           # Socket.IO handlers
│   ├── utils/             # Utility functions
│   └── index.js           # Server entry point
├── client/                # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── main.jsx       # Client entry point
│   ├── public/            # Static assets
│   └── package.json
├── package.json           # Root package.json
├── .env.example          # Environment template
└── README.md             # This file
```

## 🔧 Configuration

### Email Service Setup (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the app password in `EMAIL_PASS`

### Twilio SMS Setup
1. Create a Twilio account
2. Get a phone number from Twilio
3. Find your Account SID and Auth Token in the Twilio console
4. Add credentials to your `.env` file

### OpenAI API Setup
1. Create an OpenAI account
2. Generate an API key from the API section
3. Add the key to `OPENAI_API_KEY` in your `.env` file

## 🚀 Deployment

### Production Deployment with Docker

1. **Create Dockerfile for Server:**
```dockerfile
# Dockerfile.server
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY server/ ./server/
EXPOSE 3001
CMD ["npm", "run", "start"]
```

2. **Create Dockerfile for Client:**
```dockerfile
# Dockerfile.client
FROM node:18-alpine as build
WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

3. **Create docker-compose.yml:**
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:4.4
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  server:
    build:
      context: .
      dockerfile: Dockerfile.server
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/codecollab?authSource=admin
    depends_on:
      - mongodb
    ports:
      - "3001:3001"

  client:
    build:
      context: .
      dockerfile: Dockerfile.client
    ports:
      - "80:80"
    depends_on:
      - server

volumes:
  mongodb_data:
```

4. **Deploy with Docker Compose:**
```bash
docker-compose up -d
```

### Cloud Deployment Options

#### Vercel (Frontend)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel --prod` in the client directory
3. Configure environment variables in Vercel dashboard

#### Heroku (Backend)
1. Install Heroku CLI
2. Run `heroku create your-app-name`
3. Set environment variables: `heroku config:set VAR=value`
4. Deploy: `git push heroku main`

#### AWS/Google Cloud
1. Use container registry (ECR/GCR)
2. Deploy containers to ECS/App Engine
3. Configure load balancer and domain

### Environment Variables for Production
- Use strong, random secrets for `JWT_SECRET`
- Configure production database URLs
- Set up production email/SMS services
- Enable SSL certificates
- Configure CORS properly

## 🧪 Testing

### Running Tests
```bash
# Server tests
cd server && npm test

# Client tests
cd client && npm test

# E2E tests
npm run test:e2e
```

### Test Coverage
- Authentication flows
- Real-time collaboration
- API endpoints
- Socket.IO events
- File operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port 3001
   lsof -ti:3001
   # Kill the process
   kill -9 $(lsof -ti:3001)
   ```

2. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

3. **Email/SMS Not Working**
   - Verify API keys and credentials
   - Check rate limits on services
   - Ensure proper network connectivity

4. **Socket.IO Connection Issues**
   - Check CORS configuration
   - Verify WebSocket support
   - Check firewall settings

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=* npm run dev
```

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@codecollab.dev
- Discord: [Join our community]

---

**Built with ❤️ by the CodeCollab Team**