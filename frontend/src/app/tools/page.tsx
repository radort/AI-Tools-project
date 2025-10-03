'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api, Tool, Category, User } from '@/lib/api'

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [userLoading, setUserLoading] = useState(true)

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    console.log('Tools page: checking authentication')
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    console.log('Tools page: user data exists:', !!userData)
    console.log('Tools page: token exists:', !!token)

    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData)
        console.log('Tools page: parsed user:', parsedUser)
        setUser(parsedUser)
      } catch (e) {
        console.error('Tools page: failed to parse user data:', e)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        window.location.href = '/login'
        return
      }
    } else {
      // No valid user data, redirect to login
      console.log('Tools page: no valid auth data, redirecting to login')
      window.location.href = '/login'
      return
    }

    setUserLoading(false)
  }, [])

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadTools()
  }, [selectedCategory, selectedDifficulty, searchTerm, currentPage])

  const loadCategories = async () => {
    try {
      const response = await api.getCategories()
      setCategories(response.data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadTools = async () => {
    setLoading(true)
    setError('')

    try {
      // Double-check that we have valid auth before making API calls
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')

      if (!token || !userData) {
        console.log('No token or user data found, redirecting to login')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return
      }

      const params: any = { page: currentPage }
      if (selectedCategory) params.category = parseInt(selectedCategory)
      if (selectedDifficulty) params.difficulty = selectedDifficulty
      if (searchTerm) params.search = searchTerm

      const response = await api.getTools(params)
      setTools(response.data)
      setTotalPages(response.meta.last_page)
      setTotalItems(response.meta.total)
    } catch (error) {
      console.error('API Error:', error)

      // If we get an Unauthorized error, clear auth and redirect to login
      if (error instanceof Error && error.message === 'Unauthorized') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return
      }

      setError(error instanceof Error ? error.message : 'Failed to load tools')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadTools()
  }

  const resetFilters = () => {
    setSelectedCategory('')
    setSelectedDifficulty('')
    setSearchTerm('')
    setCurrentPage(1)
    // Force a reload after state updates
    setTimeout(() => loadTools(), 0)
  }

  const canCreateTools = user !== null // Anyone logged in can create tools

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view tools</h1>
          <Link href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Login
          </Link>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">AI Tools Hub</h1>
            </div>

            {user && (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{user.name}</span>
                  <span className="ml-2 text-gray-500">({user.role})</span>
                </div>
                <Link
                  href="/account"
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Tools Collection</h1>
              <p className="mt-2 text-gray-600">Discover and manage AI tools for your projects</p>
            </div>
            <div className="flex space-x-4">
              {canCreateTools && (
                <Link
                  href="/tools/new"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add New Tool
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="flex items-end space-x-2">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Results Info */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {tools.length} of {totalItems} tools
          </p>
        </div>

        {/* Tools Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-gray-600">Loading tools...</div>
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600 mb-4">No tools found</div>
            {canCreateTools && (
              <Link
                href="/tools/new"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Add the first tool
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div key={tool.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{tool.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    tool.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    tool.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {tool.difficulty}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{tool.description}</p>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {tool.categories.map((category) => (
                      <span
                        key={category.id}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tool.roles.map((role) => (
                      <span
                        key={role.id}
                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Created by {tool.creator.name}
                </div>

                <div className="flex space-x-2">
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-2 px-3 rounded text-center"
                  >
                    Visit Tool
                  </a>
                  <Link
                    href={`/tools/${tool.id}`}
                    className="flex-1 bg-gray-500 hover:bg-gray-700 text-white text-sm font-bold py-2 px-3 rounded text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}