import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiPhone, FiLock, FiShield, FiArrowLeft, FiCheck } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/UI/Button'
import Input from '../components/UI/Input'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import toast from 'react-hot-toast'

const SignupPage = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    phoneNumber: '',
    otp: '',
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const { sendOTP, signup, loading, clearError } = useAuth()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateStep1 = () => {
    const newErrors = {}
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    
    if (!formData.otp) {
      newErrors.otp = 'OTP is required'
    } else if (!/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = 'OTP must be 6 digits'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors = {}
    
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.username) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    clearError()
    
    if (!validateStep1()) return
    
    try {
      await sendOTP(formData.phoneNumber)
      setStep(2)
      toast.success('OTP sent to your phone number')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP')
    }
  }

  const handleVerifyOTP = (e) => {
    e.preventDefault()
    clearError()
    
    if (!validateStep2()) return
    
    // In a real app, you would verify the OTP here
    // For now, we'll just move to the next step
    setStep(3)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    clearError()
    
    if (!validateStep3()) return
    
    try {
      const { confirmPassword, ...signupData } = formData
      await signup(signupData)
      toast.success('Account created successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed')
    }
  }

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="w-full"
    >
      <form onSubmit={handleSendOTP} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Start by verifying your phone number</p>
        </div>

        <Input
          label="Phone Number"
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          error={errors.phoneNumber}
          icon={FiPhone}
          placeholder="+1 (555) 123-4567"
          required
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full"
        >
          Send Verification Code
        </Button>
      </form>
    </motion.div>
  )

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="w-full"
    >
      <form onSubmit={handleVerifyOTP} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Phone Number</h2>
          <p className="text-gray-600">We sent a 6-digit code to {formData.phoneNumber}</p>
        </div>

        <Input
          label="Verification Code"
          name="otp"
          type="text"
          value={formData.otp}
          onChange={handleInputChange}
          error={errors.otp}
          icon={FiShield}
          placeholder="123456"
          maxLength={6}
          required
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full"
        >
          Verify Code
        </Button>

        <button
          type="button"
          onClick={() => setStep(1)}
          className="w-full text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center"
        >
          <FiArrowLeft className="w-4 h-4 mr-1" />
          Back to phone number
        </button>
      </form>
    </motion.div>
  )

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="w-full"
    >
      <form onSubmit={handleSignup} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600">Almost done! Tell us about yourself</p>
        </div>

        <Input
          label="Full Name"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleInputChange}
          error={errors.fullName}
          icon={FiUser}
          placeholder="John Doe"
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          icon={FiMail}
          placeholder="john@example.com"
          required
        />

        <Input
          label="Username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleInputChange}
          error={errors.username}
          icon={FiUser}
          placeholder="johndoe"
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          icon={FiLock}
          placeholder="••••••••"
          required
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
          icon={FiLock}
          placeholder="••••••••"
          required
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full"
        >
          Create Account
        </Button>

        <button
          type="button"
          onClick={() => setStep(2)}
          className="w-full text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center"
        >
          <FiArrowLeft className="w-4 h-4 mr-1" />
          Back to verification
        </button>
      </form>
    </motion.div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2">
          {[1, 2, 3].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  step >= stepNumber
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step > stepNumber ? (
                  <FiCheck className="w-4 h-4" />
                ) : (
                  stepNumber
                )}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`w-12 h-1 transition-colors ${
                    step > stepNumber ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default SignupPage