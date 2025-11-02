import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const { token, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io('/', {
        auth: {
          token
        },
        transports: ['websocket', 'polling']
      })

      // Connection events
      newSocket.on('connect', () => {
        console.log('Connected to server')
        setConnected(true)
        toast.success('Connected to CodeCollab server')
      })

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server')
        setConnected(false)
        toast.error('Disconnected from server')
      })

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error)
        toast.error('Failed to connect to server')
      })

      // Error handling
      newSocket.on('error', (error) => {
        console.error('Socket error:', error)
        toast.error(error.message || 'An error occurred')
      })

      // Chat events
      newSocket.on('new-message', (data) => {
        toast(`New message from ${data.message.sender.username}`, {
          icon: '💬',
          duration: 3000
        })
      })

      newSocket.on('user-typing', (data) => {
        // Handle typing indicator
        console.log(`${data.username} is typing...`)
      })

      // Project collaboration events
      newSocket.on('user-joined', (data) => {
        toast(`${data.user.username} joined the project`, {
          icon: '👋',
          duration: 2000
        })
      })

      newSocket.on('user-left', (data) => {
        toast(`${data.username} left the project`, {
          icon: '👋',
          duration: 2000
        })
      })

      // Video call events
      newSocket.on('video-call-offer', (data) => {
        toast(`${data.fromUsername} is calling you`, {
          icon: '📞',
          duration: 5000
        })
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
        setSocket(null)
        setConnected(false)
      }
    } else {
      if (socket) {
        socket.close()
        setSocket(null)
        setConnected(false)
      }
    }
  }, [isAuthenticated, token])

  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data)
    }
  }

  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback)
    }
  }

  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback)
    }
  }

  const value = {
    socket,
    connected,
    emit,
    on,
    off
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}