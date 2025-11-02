const express = require('express');
const Project = require('../models/Project');
const router = express.Router();

// Get all projects for a user
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const projects = await Project.find({
      $or: [
        { owner: decoded.userId },
        { 'collaborators.user': decoded.userId }
      ]
    }).populate('owner', 'username fullName avatar')
      .populate('collaborators.user', 'username fullName avatar')
      .sort({ updatedAt: -1 });

    res.status(200).json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Failed to get projects' });
  }
});

// Create a new project
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const { name, description, language } = req.body;

    const project = new Project({
      name,
      description,
      owner: decoded.userId,
      language: language || 'javascript',
      files: [{
        name: 'main.js',
        content: '// Welcome to CodeCollab!\
// Start coding here...',
        language: language || 'javascript',
        path: '/main.js',
        isFolder: false
      }]
    });

    await project.save();
    await project.populate('owner', 'username fullName avatar');

    res.status(201).json({ project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// Get a specific project
router.get('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username fullName avatar')
      .populate('collaborators.user', 'username fullName avatar')
      .populate('activeUsers.user', 'username fullName avatar');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access
    const hasAccess = project.owner._id.toString() === decoded.userId ||
                     project.collaborators.some(c => c.user._id.toString() === decoded.userId);

    if (!hasAccess && !project.isPublic) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Failed to get project' });
  }
});

// Add collaborator to project
router.post('/:id/collaborators', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const { userId, permission } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or admin
    const isOwner = project.owner.toString() === decoded.userId;
    const isAdmin = project.collaborators.some(c => 
      c.user.toString() === decoded.userId && c.permission === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only owner or admin can add collaborators' });
    }

    // Check if user is already a collaborator
    const existingCollaborator = project.collaborators.find(c => 
      c.user.toString() === userId
    );

    if (existingCollaborator) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    project.collaborators.push({
      user: userId,
      permission: permission || 'write'
    });

    await project.save();
    await project.populate('collaborators.user', 'username fullName avatar');

    res.status(200).json({ project });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({ message: 'Failed to add collaborator' });
  }
});

// Update project file
router.put('/:id/files', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const { fileId, content } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has write access
    const hasWriteAccess = project.owner.toString() === decoded.userId ||
                           project.collaborators.some(c => 
                             c.user.toString() === decoded.userId && 
                             ['write', 'admin'].includes(c.permission)
                           );

    if (!hasWriteAccess) {
      return res.status(403).json({ message: 'Write access denied' });
    }

    const file = project.files.id(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    file.content = content;
    await project.save();

    res.status(200).json({ file });
  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({ message: 'Failed to update file' });
  }
});

module.exports = router;