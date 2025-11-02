import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  FiPlus, 
  FiCode, 
  FiUsers, 
  FiClock, 
  FiSearch, 
  FiFilter,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiUserPlus
} from 'react-icons/fi'
import { projectsAPI } from '../services/api'
import Button from '../components/UI/Button'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import toast from 'react-hot-toast'

const DashboardPage = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    language: 'javascript'
  })
  const navigate = useNavigate()

  const languages = [
    { value: 'javascript', label: 'JavaScript', color: 'bg-yellow-500' },
    { value: 'python', label: 'Python', color: 'bg-blue-500' },
    { value: 'java', label: 'Java', color: 'bg-red-500' },
    { value: 'cpp', label: 'C++', color: 'bg-purple-500' },
    { value: 'html', label: 'HTML', color: 'bg-orange-500' },
    { value: 'css', label: 'CSS', color: 'bg-blue-400' },
    { value: 'typescript', label: 'TypeScript', color: 'bg-blue-600' },
    { value: 'react', label: 'React', color: 'bg-cyan-500' }
  ]

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll()
      setProjects(response.data.projects)
    } catch (error) {
      toast.error('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    
    if (!newProject.name.trim()) {
      toast.error('Project name is required')
      return
    }

    try {
      const response = await projectsAPI.create(newProject)
      setProjects(prev => [response.data.project, ...prev])
      setShowNewProjectModal(false)
      setNewProject({ name: '', description: '', language: 'javascript' })
      toast.success('Project created successfully!')
      navigate(`/editor/${response.data.project._id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project')
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === 'all') return matchesSearch
    if (filter === 'owned') return matchesSearch && project.owner?._id === 'current-user' // Replace with actual user ID
    if (filter === 'collaborating') return matchesSearch && project.owner?._id !== 'current-user'
    
    return matchesSearch
  })

  const getLanguageColor = (language) => {
    const lang = languages.find(l => l.value === language)
    return lang ? lang.color : 'bg-gray-500'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your coding projects</p>
          </div>
          <Button
            onClick={() => setShowNewProjectModal(true)}
            icon={FiPlus}
          >
            New Project
          </Button>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <FiFilter className="text-gray-400 w-5 h-5" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Projects</option>
            <option value="owned">Owned by me</option>
            <option value="collaborating">Collaborating</option>
          </select>
        </div>
      </motion.div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
            onClick={() => navigate(`/editor/${project._id}`)}
          >
            <div className="p-6">
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${getLanguageColor(project.language)} rounded-lg flex items-center justify-center`}>
                    <FiCode className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {project.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span className="capitalize">{project.language}</span>
                      <span>•</span>
                      <span>{formatDate(project.updatedAt)}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // Handle menu
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiMoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Project Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {project.description || 'No description available'}
              </p>

              {/* Project Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <FiUsers className="w-4 h-4" />
                    <span>{project.collaborators?.length || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <FiClock className="w-4 h-4" />
                    <span>{formatDate(project.updatedAt)}</span>
                  </div>
                </div>
                
                {project.collaborators && project.collaborators.length > 0 && (
                  <div className="flex -space-x-2">
                    {project.collaborators.slice(0, 3).map((collaborator, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full border-2 border-white flex items-center justify-center"
                      >
                        <span className="text-xs text-white font-medium">
                          {collaborator.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    ))}
                    {project.collaborators.length > 3 && (
                      <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-xs text-gray-600 font-medium">
                          +{project.collaborators.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCode className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter'
              : 'Create your first project to get started'
            }
          </p>
          {!searchTerm && filter === 'all' && (
            <Button onClick={() => setShowNewProjectModal(true)} icon={FiPlus}>
              Create Project
            </Button>
          )}
        </motion.div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowNewProjectModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Project</h2>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="My Awesome Project"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="What's this project about?"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={newProject.language}
                  onChange={(e) => setNewProject(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowNewProjectModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create Project
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default DashboardPage