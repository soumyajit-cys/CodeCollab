import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiCalendar, FiEdit3, FiCamera, FiSave, FiX } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { usersAPI } from '../services/api'
import Button from '../components/UI/Button'
import Input from '../components/UI/Input'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    username: user?.username || '',
    bio: ''
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Update profile API call would go here
      toast.success('Profile updated successfully!')
      setEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      username: user?.username || '',
      bio: ''
    })
    setEditing(false)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm"
      >
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-xl p-8">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-600">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50">
                <FiCamera className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-white">
              <h1 className="text-2xl font-bold">{user?.fullName}</h1>
              <p className="text-primary-100">@{user?.username}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-primary-100">
                <div className="flex items-center space-x-1">
                  <FiMail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FiCalendar className="w-4 h-4" />
                  <span>Joined {formatDate(user?.createdAt || new Date())}</span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex space-x-2">
              {!editing ? (
                <Button
                  onClick={() => setEditing(true)}
                  variant="secondary"
                  icon={FiEdit3}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    loading={loading}
                    icon={FiSave}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="secondary"
                    icon={FiX}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  icon={FiUser}
                  disabled={!editing}
                />

                <Input
                  label="Username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  icon={FiUser}
                  disabled={!editing}
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  icon={FiMail}
                  disabled={!editing}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!editing}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="online">Online</option>
                    <option value="away">Away</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">12</div>
                <p className="text-sm text-gray-600">Projects</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">48</div>
                <p className="text-sm text-gray-600">Collaborators</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">156</div>
                <p className="text-sm text-gray-600">Commits</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">89%</div>
                <p className="text-sm text-gray-600">Completion Rate</p>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            
            <div className="space-y-4">
              {[
                { action: 'Created project', target: 'Weather Dashboard', time: '2 hours ago' },
                { action: 'Collaborated on', target: 'E-commerce Site', time: '5 hours ago' },
                { action: 'Completed', target: 'API Integration', time: '1 day ago' },
                { action: 'Joined', target: 'Team Chat', time: '2 days ago' }
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-gray-900">{activity.action} </span>
                    <span className="font-medium text-gray-900">{activity.target}</span>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ProfilePage