import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null }
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload.user, 
        token: action.payload.token,
        isAuthenticated: true,
        error: null 
      }
    case 'LOGIN_FAILURE':
      return { 
        ...state, 
        loading: false, 
        error: action.payload,
        isAuthenticated: false 
      }
    case 'LOGOUT':
      return { 
        ...state, 
        user: null, 
        token: null, 
        isAuthenticated: false,
        error: null 
      }
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: true,
        loading: false 
      }
    case 'SIGNUP_START':
      return { ...state, loading: true, error: null }
    case 'SIGNUP_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload.user, 
        token: action.payload.token,
        isAuthenticated: true,
        error: null 
      }
    case 'SIGNUP_FAILURE':
      return { 
        ...state, 
        loading: false, 
        error: action.payload,
        isAuthenticated: false 
      }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await authAPI.verify()
          dispatch({ type: 'SET_USER', payload: response.data.user })
        } catch (error) {
          localStorage.removeItem('token')
          dispatch({ type: 'LOGOUT' })
        }
      }
    }
    checkAuth()
  }, [])

  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      const response = await authAPI.login(credentials)
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { token, user } 
      })
      
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed'
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: errorMessage 
      })
      throw error
    }
  }

  const signup = async (userData) => {
    try {
      dispatch({ type: 'SIGNUP_START' })
      const response = await authAPI.verifyOTP(userData)
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      dispatch({ 
        type: 'SIGNUP_SUCCESS', 
        payload: { token, user } 
      })
      
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed'
      dispatch({ 
        type: 'SIGNUP_FAILURE', 
        payload: errorMessage 
      })
      throw error
    }
  }

  const logout = async () => {
    try {
      if (state.token) {
        await authAPI.logout()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      dispatch({ type: 'LOGOUT' })
    }
  }

  const sendOTP = async (phoneNumber) => {
    try {
      dispatch({ type: 'SIGNUP_START' })
      const response = await authAPI.sendOTP({ phoneNumber })
      dispatch({ type: 'SIGNUP_START' }) // Keep loading state for OTP verification
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP'
      dispatch({ 
        type: 'SIGNUP_FAILURE', 
        payload: errorMessage 
      })
      throw error
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    ...state,
    login,
    signup,
    logout,
    sendOTP,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}