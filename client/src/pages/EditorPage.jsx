import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import { 
  FiUsers, 
  FiMessageSquare, 
  FiVideo, 
  FiSettings, 
  FiSidebar,
  FiX,
  FiSend,
  FiBot,
  FiFile,
  FiFolder,
  FiPlus,
  FiTrash2,
  FiEdit3,
  FiSave,
  FiShare2
} from 'react-icons/fi'
import { useSocket } from '../contexts/AuthContext'
import { projectsAPI } from '../services/api'
import toast from 'react-hot-toast'

const EditorPage = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { socket, connected } = useSocket()
  
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeUsers, setActiveUsers] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [files, setFiles] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [aiMessages, setAiMessages] = useState([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [aiMessage, setAiMessage] = useState('')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const editorRef = useRef(null)

  const languages = [
    { value: 'javascript', label: 'JavaScript', monaco: 'javascript' },
    { value: 'typescript', label: 'TypeScript', monaco: 'typescript' },
    { value: 'python', label: 'Python', monaco: 'python' },
    { value: 'java', label: 'Java', monaco: 'java' },
    { value: 'cpp', label: 'C++', monaco: 'cpp' },
    { value: 'html', label: 'HTML', monaco: 'html' },
    { value: 'css', label: 'CSS', monaco: 'css' },
    { value: 'json', label: 'JSON', monaco: 'json' },
    { value: 'markdown', label: 'Markdown', monaco: 'markdown' }
  ]

  useEffect(() => {
    fetchProject()
  }, [projectId])

  useEffect(() => {
    if (socket && project) {
      // Join project room
      socket.emit('join-project', projectId)
      
      // Listen for project events
      socket.on('project-joined', (data) => {
        setActiveUsers(data.activeUsers)
      })

      socket.on('user-joined', (data) => {
        setActiveUsers(data.activeUsers)
        toast(`${data.user.username} joined the project`, { icon: '👋' })
      })

      socket.on('user-left', (data) => {
        setActiveUsers(prev => prev.filter(u => u.userId !== data.userId))
        toast(`${data.username} left the project`, { icon: '👋' })
      })

      socket.on('code-change', (data) => {
        if (data.fileId === selectedFile?._id && data.userId !== socket.userId) {
          setCode(data.content)
        }
      })

      socket.on('ai-response', (data) => {
        setAiMessages(prev => [...prev, {
          type: 'ai',
          content: data.message,
          timestamp: new Date()
        }])
      })

      return () => {
        socket.emit('leave-project', projectId)
        socket.off('project-joined')
        socket.off('user-joined')
        socket.off('user-left')
        socket.off('code-change')
        socket.off('ai-response')
      }
    }
  }, [socket, project, projectId])

  const fetchProject = async () => {
    try {
      const response = await projectsAPI.getById(projectId)
      const projectData = response.data.project
      setProject(projectData)
      setFiles(projectData.files || [])
      
      if (projectData.files && projectData.files.length > 0) {
        const firstFile = projectData.files[0]
        setSelectedFile(firstFile)
        setCode(firstFile.content || '')
        setLanguage(firstFile.language || 'javascript')
      }
    } catch (error) {
      toast.error('Failed to load project')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleEditorChange = (value) => {
    setCode(value)
    
    if (socket && selectedFile) {
      socket.emit('code-change', {
        projectId,
        fileId: selectedFile._id,
        content: value,
        operation: 'change'
      })
    }
  }

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor
    
    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: true },
      fontSize: 14,
      wordWrap: 'on',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      renderLineHighlight: 'line',
      renderWhitespace: 'selection',
      tabSize: 2,
      insertSpaces: true
    })

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveFile()
    })
  }

  const saveFile = async () => {
    if (!selectedFile) return
    
    try {
      await projectsAPI.updateFile(projectId, {
        fileId: selectedFile._id,
        content: code
      })
      toast.success('File saved successfully')
    } catch (error) {
      toast.error('Failed to save file')
    }
  }

  const sendMessage = () => {
    if (!currentMessage.trim()) return
    
    const message = {
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    }
    
    setChatMessages(prev => [...prev, message])
    
    if (socket) {
      socket.emit('send-message', {
        chatId: 'project-chat', // This would be a real chat ID
        content: currentMessage,
        type: 'text'
      })
    }
    
    setCurrentMessage('')
  }

  const sendAiMessage = () => {
    if (!aiMessage.trim()) return
    
    const message = {
      type: 'user',
      content: aiMessage,
      timestamp: new Date()
    }
    
    setAiMessages(prev => [...prev, message])
    
    if (socket) {
      socket.emit('ai-chat', {
        message: aiMessage,
        code: code,
        language: language
      })
    }
    
    setAiMessage('')
  }

  const getFileLanguage = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase()
    const langMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'cc': 'cpp',
      'c': 'c',
      'html': 'html',
      'htm': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown'
    }
    return langMap[ext] || 'plaintext'
  }

  const getMonacoLanguage = (lang) => {
    const languageConfig = languages.find(l => l.value === lang)
    return languageConfig ? languageConfig.monaco : 'plaintext'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-80 bg-white border-r border-gray-200 flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">{project?.name}</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <FiSidebar className="w-4 h-4" />
                </button>
              </div>
              
              {/* Active Users */}
              <div className="flex items-center space-x-2">
                <FiUsers className="w-4 h-4 text-gray-500" />
                <div className="flex -space-x-2">
                  {activeUsers.map((user, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 bg-primary-500 rounded-full border-2 border-white flex items-center justify-center"
                      title={user.user?.username}
                    >
                      <span className="text-xs text-white font-medium">
                        {user.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  ))}
                  {activeUsers.length === 0 && (
                    <span className="text-xs text-gray-500">No active users</span>
                  )}
                </div>
              </div>
            </div>

            {/* File Explorer */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Files</h3>
                <button className="p-1 hover:bg-gray-100 rounded-lg">
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-1">
                {files.map((file) => (
                  <div
                    key={file._id}
                    onClick={() => {
                      setSelectedFile(file)
                      setCode(file.content || '')
                      setLanguage(file.language || getFileLanguage(file.name))
                    }}
                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedFile?._id === file._id
                        ? 'bg-primary-50 text-primary-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <FiFile className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm truncate flex-1">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FiSidebar className="w-5 h-5" />
                </button>
              )}
              
              <div className="flex items-center space-x-2">
                <FiFile className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">
                  {selectedFile?.name || 'No file selected'}
                </span>
              </div>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={saveFile}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Save (Ctrl+S)"
              >
                <FiSave className="w-4 h-4" />
              </button>
              
              <button className="p-2 hover:bg-gray-100 rounded-lg" title="Share">
                <FiShare2 className="w-4 h-4" />
              </button>

              <div className="h-6 w-px bg-gray-300" />

              <button
                onClick={() => setChatOpen(!chatOpen)}
                className={`p-2 rounded-lg relative ${
                  chatOpen ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'
                }`}
                title="Chat"
              >
                <FiMessageSquare className="w-4 h-4" />
              </button>

              <button
                onClick={() => setAiChatOpen(!aiChatOpen)}
                className={`p-2 rounded-lg relative ${
                  aiChatOpen ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'
                }`}
                title="AI Assistant"
              >
                <FiBot className="w-4 h-4" />
              </button>

              <button
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Video Call"
              >
                <FiVideo className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          {selectedFile ? (
            <Editor
              height="100%"
              language={getMonacoLanguage(language)}
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                renderLineHighlight: 'line',
                renderWhitespace: 'selection'
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FiFile className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a file to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            className="w-80 bg-white border-l border-gray-200 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Team Chat</h3>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((message, idx) => (
                <div key={idx} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Chat Panel */}
      <AnimatePresence>
        {aiChatOpen && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            className="w-80 bg-white border-l border-gray-200 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiBot className="w-4 h-4 text-primary-600" />
                <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              </div>
              <button
                onClick={() => setAiChatOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {aiMessages.map((message, idx) => (
                <div key={idx} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {aiMessages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <FiBot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Ask me anything about your code!</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendAiMessage()}
                  placeholder="Ask about your code..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={sendAiMessage}
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EditorPage