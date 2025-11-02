import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiSend, FiMoreVertical, FiUserPlus } from 'react-icons/fi'
import { useSocket } from '../contexts/AuthContext'
import { chatAPI, usersAPI } from '../services/api'
import toast from 'react-hot-toast'

const ChatPage = () => {
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const { socket, on, off, emit } = useSocket()

  useEffect(() => {
    fetchChats()
    
    if (socket) {
      on('new-message', handleNewMessage)
      
      return () => {
        off('new-message', handleNewMessage)
      }
    }
  }, [socket])

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id)
      markAsRead(selectedChat._id)
    }
  }, [selectedChat])

  const fetchChats = async () => {
    try {
      const response = await chatAPI.getAll()
      setChats(response.data.chats)
    } catch (error) {
      toast.error('Failed to fetch chats')
    }
  }

  const fetchMessages = async (chatId) => {
    try {
      const response = await chatAPI.getById(chatId)
      setMessages(response.data.chat.messages || [])
    } catch (error) {
      toast.error('Failed to fetch messages')
    }
  }

  const markAsRead = async (chatId) => {
    try {
      await chatAPI.markAsRead(chatId)
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleNewMessage = (data) => {
    if (data.chatId === selectedChat?._id) {
      setMessages(prev => [...prev, data.message])
      markAsRead(data.chatId)
    }
    
    // Update chat list
    setChats(prev => prev.map(chat => 
      chat._id === data.chatId 
        ? { ...chat, lastMessage: data.message, updatedAt: new Date() }
        : chat
    ))
  }

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return

    try {
      const response = await chatAPI.sendMessage(selectedChat._id, {
        content: messageInput,
        type: 'text'
      })

      setMessages(prev => [...prev, response.data.message])
      setMessageInput('')
      
      if (socket) {
        emit('send-message', {
          chatId: selectedChat._id,
          content: messageInput,
          type: 'text'
        })
      }
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const searchUsers = async () => {
    if (!userSearch.trim()) return

    try {
      const response = await usersAPI.searchUsers(userSearch)
      setSearchResults(response.data.users)
    } catch (error) {
      toast.error('Failed to search users')
    }
  }

  const startNewChat = async (user) => {
    try {
      const response = await chatAPI.start({ participantId: user._id })
      const newChat = response.data.chat
      
      setChats(prev => [newChat, ...prev])
      setSelectedChat(newChat)
      setShowNewChat(false)
      setUserSearch('')
      setSearchResults([])
      toast.success('Chat started successfully')
    } catch (error) {
      toast.error('Failed to start chat')
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const getOtherParticipant = (chat) => {
    // This would need to be adjusted based on the actual user ID
    return chat.participants[0] // Placeholder
  }

  const filteredChats = chats.filter(chat => {
    const participant = getOtherParticipant(chat)
    return participant?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           chat.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <FiUserPlus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => {
            const participant = getOtherParticipant(chat)
            const unreadCount = chat.getUnreadCount?.('current-user') || 0 // Replace with actual user ID
            
            return (
              <div
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                  selectedChat?._id === chat._id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-lg">
                    {participant?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 truncate">
                      {participant?.fullName || 'Unknown User'}
                    </p>
                    <span className="text-xs text-gray-500">
                      {chat.lastMessage && formatTime(chat.updatedAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {chat.lastMessage?.content || 'No messages yet'}
                    </p>
                    {unreadCount > 0 && (
                      <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          
          {filteredChats.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No conversations yet</p>
              <button
                onClick={() => setShowNewChat(true)}
                className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                Start a conversation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {getOtherParticipant(selectedChat)?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {getOtherParticipant(selectedChat)?.fullName}
                  </p>
                  <p className="text-sm text-gray-500">Active now</p>
                </div>
              </div>
              
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <FiMoreVertical className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.sender?._id === 'current-user' ? 'justify-end' : 'justify-start'}`} // Replace with actual user ID
              >
                <div className={`max-w-xs lg:max-w-md chat-message ${
                  message.sender?._id === 'current-user' ? 'sent' : 'received'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender?._id === 'current-user' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={sendMessage}
                className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <FiSend className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUserPlus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose a chat from the list or start a new conversation</p>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChat && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowNewChat(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Start New Conversation</h3>
            
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => startNewChat(user)}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.fullName}</p>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                ))}
                
                {searchResults.length === 0 && userSearch && (
                  <p className="text-center text-gray-500 py-4">No users found</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowNewChat(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default ChatPage