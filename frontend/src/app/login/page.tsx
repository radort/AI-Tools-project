'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Attempting user login for:', email)
      const response = await api.login(email, password)
      console.log('User login response:', response)

      if (response.requires_intermediate_auth && response.intermediate_token) {
        console.log('User login successful, redirecting to intermediate auth')
        // Redirect to intermediate authentication with token
        router.push(`/authenticate?token=${encodeURIComponent(response.intermediate_token)}`)
      } else if (response.token && response.user) {
        // Fallback for direct login (if 2FA not implemented yet)
        console.log('User login successful, storing token and redirecting')
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))

        // Small delay to ensure localStorage is set before redirect
        setTimeout(() => {
          window.location.href = '/tools'
        }, 100)
      } else {
        console.log('Unexpected user login response format:', response)
        setError('Unexpected login response format')
      }
    } catch (err) {
      console.error('User login error:', err)
      if (err instanceof TypeError && err.message.includes('JSON')) {
        setError('Server error: Unable to parse response')
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use one of the following test credentials:
          </p>
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <div><strong>Frontend:</strong> frontend@example.com / password123</div>
            <div><strong>Backend:</strong> backend@example.com / password123</div>
            <div><strong>QA:</strong> qa@example.com / password123</div>
            <div><strong>PM:</strong> pm@example.com / password123</div>
            <div><strong>Owner:</strong> owner@example.com / password123</div>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}