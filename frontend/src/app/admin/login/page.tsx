'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    //console.log('🔥 Form submitted!', { email, password })
    e.preventDefault()
    e.stopPropagation()
    //console.log('🔥 preventDefault called')
    setLoading(true)
    setError('')

    try {
      //console.log('🔥 About to fetch /api/admin/login')
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      //console.log('🔥 Response received:', response.status, response.statusText)

      const data = await response.json()
      //console.log('🔥 Response data:', data)

      if (response.ok) {
        //console.log('🔥 Login response data:', JSON.stringify(data, null, 2))
        if (data.requires_intermediate_auth && data.intermediate_token) {
          //console.log('🔥 Login successful! Redirecting to intermediate auth')
          //console.log('🔥 Intermediate token:', data.intermediate_token)
          const redirectUrl = `/admin/authenticate?token=${encodeURIComponent(data.intermediate_token)}`
          //console.log('🔥 Redirecting to:', redirectUrl)
          // Use window.location for reliable redirect
          //console.log('🔥 About to redirect...')
          // Force immediate redirect
          //console.log('🔥 Executing redirect now!')
          document.location.href = redirectUrl
          return // Exit immediately after redirect
        } else if (data.token && data.admin) {
          // Fallback for direct login (if 2FA not implemented yet)
          //console.log('🔥 Login successful! Storing token and redirecting')
          localStorage.setItem('admin_token', data.token)
          localStorage.setItem('admin_user', JSON.stringify(data.admin))

          // Set cookie for middleware
          document.cookie = `admin_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
          //console.log('🔥 Cookie set for middleware')

          document.location.href = '/admin/dashboard'
          return // Exit immediately after redirect
        } else {
          //console.log('🔥 Unexpected login response format:', data)
          //console.log('🔥 Expected either requires_intermediate_auth+intermediate_token OR token+admin')
          setError('Unexpected login response format')
        }
      } else {
        //console.log('🔥 Login failed:', data)
        setError(data.message || 'Login failed')
        setLoading(false)
      }
    } catch (err) {
      console.error('🔥 Network error:', err)
      setError('Network error')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your admin credentials
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <div className="bg-gray-50 rounded p-3 text-sm">
              <p className="font-medium text-gray-700 mb-1">Test Credentials:</p>
              <p className="text-gray-600">Email: admin@example.com</p>
              <p className="text-gray-600">Password: password</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}