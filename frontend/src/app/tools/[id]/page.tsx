'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { api, Tool, Category, User } from '@/lib/api'
import CommentSection from '@/components/comments/CommentSection'
import RatingSummary from '@/components/ratings/RatingSummary'
import StarRating from '@/components/ratings/StarRating'

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const ROLE_OPTIONS = [
  { id: 1, name: 'owner' },
  { id: 2, name: 'pm' },
  { id: 3, name: 'developer' },
  { id: 4, name: 'designer' },
  { id: 5, name: 'analyst' },
]

type TabType = 'overview' | 'comments' | 'ratings'

export default function ToolDetailPage() {
  const router = useRouter()
  const params = useParams()
  const toolId = parseInt(params.id as string)

  const [user, setUser] = useState<User | null>(null)
  const [tool, setTool] = useState<Tool | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Form data for editing
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    docs_url: '',
    video_url: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    categories: [] as number[],
    roles: [] as number[],
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    fetchData()
  }, [toolId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [toolResponse, categoriesResponse] = await Promise.all([
        api.get(`/tools/${toolId}`),
        api.get('/categories')
      ])

      setTool(toolResponse.data)
      setCategories(categoriesResponse.data)

      // Initialize form data with current tool data
      const toolData = toolResponse.data
      setFormData({
        name: toolData.name || '',
        description: toolData.description || '',
        url: toolData.url || '',
        docs_url: toolData.docs_url || '',
        video_url: toolData.video_url || '',
        difficulty: toolData.difficulty || 'beginner',
        categories: toolData.categories?.map((cat: Category) => cat.id) || [],
        roles: toolData.roles?.map((role: any) => role.id) || [],
      })
    } catch (err) {
      console.error('Error fetching tool:', err)
      setError('Failed to load tool')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCheckboxChange = (type: 'categories' | 'roles', id: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter(item => item !== id)
        : [...prev[type], id]
    }))
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data to original tool data
    if (tool) {
      setFormData({
        name: tool.name || '',
        description: tool.description || '',
        url: tool.url || '',
        docs_url: tool.docs_url || '',
        video_url: tool.video_url || '',
        difficulty: tool.difficulty || 'beginner',
        categories: tool.categories?.map((cat: Category) => cat.id) || [],
        roles: tool.roles?.map((role: any) => role.id) || [],
      })
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')

      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in to edit tools')
        return
      }

      await api.put(`/tools/${toolId}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      // Refresh tool data
      await fetchData()
      setIsEditing(false)
    } catch (err: any) {
      console.error('Error updating tool:', err)
      setError(err.response?.data?.message || 'Failed to update tool')
    } finally {
      setSaving(false)
    }
  }

  const canEditTool = user && tool && (user.id === tool.created_by)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview' },
    { id: 'comments' as TabType, label: 'Comments' },
    { id: 'ratings' as TabType, label: 'Ratings' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !tool) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <Link href="/tools" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            ← Back to Tools
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/tools" className="text-blue-600 hover:text-blue-800">
            ← Back to Tools
          </Link>
          {canEditTool && !isEditing && (
            <button
              onClick={handleEdit}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Edit Tool
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {tool && !isEditing && (
            <>
              {/* Tool Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool.name}</h1>
                    <p className="text-gray-600 text-lg mb-4">{tool.description}</p>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 text-sm rounded-full capitalize ${getDifficultyColor(tool.difficulty)}`}>
                        {tool.difficulty}
                      </span>
                      <div className="flex items-center gap-2">
                        <StarRating value={4.2} readonly size="sm" showValue />
                        <span className="text-sm text-gray-500">(24 reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded text-center transition-colors"
                      >
                        Visit Tool →
                      </a>
                      {tool.docs_url && (
                        <a
                          href={tool.docs_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded text-center transition-colors"
                        >
                          View Documentation →
                        </a>
                      )}
                      {tool.video_url && (
                        <a
                          href={tool.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-4 rounded text-center transition-colors"
                        >
                          Watch Tutorial →
                        </a>
                      )}
                    </div>

                    {/* Categories and Roles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
                        <div className="flex flex-wrap gap-2">
                          {tool.categories.map((category) => (
                            <span
                              key={category.id}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              {category.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Target Roles</h3>
                        <div className="flex flex-wrap gap-2">
                          {tool.roles.map((role) => (
                            <span
                              key={role.id}
                              className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full capitalize"
                            >
                              {role.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Tool Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Tool Information</h3>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Created by</dt>
                          <dd className="text-sm text-gray-900">{tool.creator?.name || 'Unknown'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd className="text-sm text-gray-900 capitalize">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              tool.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : tool.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {tool.status}
                            </span>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}

                {activeTab === 'comments' && (
                  <CommentSection
                    toolId={toolId}
                    userToken={localStorage.getItem('token') || undefined}
                  />
                )}

                {activeTab === 'ratings' && (
                  <RatingSummary
                    toolId={toolId}
                    userToken={localStorage.getItem('token') || undefined}
                  />
                )}
              </div>
            </>
          )}

          {/* Edit Mode */}
          {tool && isEditing && (
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Edit Tool</h2>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                {/* Edit form fields */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Tool Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                      Tool URL *
                    </label>
                    <input
                      type="url"
                      id="url"
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level *
                    </label>
                    <select
                      id="difficulty"
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      {DIFFICULTY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="docs_url" className="block text-sm font-medium text-gray-700 mb-2">
                      Documentation URL
                    </label>
                    <input
                      type="url"
                      id="docs_url"
                      name="docs_url"
                      value={formData.docs_url}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-2">
                      Video Tutorial URL
                    </label>
                    <input
                      type="url"
                      id="video_url"
                      name="video_url"
                      value={formData.video_url}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(category.id)}
                          onChange={() => handleCheckboxChange('categories', category.id)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-900">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Roles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Roles *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {ROLE_OPTIONS.map((role) => (
                      <label key={role.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.roles.includes(role.id)}
                          onChange={() => handleCheckboxChange('roles', role.id)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-900 capitalize">{role.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}