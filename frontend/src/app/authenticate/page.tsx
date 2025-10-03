'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthenticatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [requires2FA, setRequires2FA] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }

    // Try to authenticate with just the token first (no 2FA)
    authenticateUser('')
  }, [token, router])

  const authenticateUser = async (twoFactorCode: string) => {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          ...(twoFactorCode && { two_factor_code: twoFactorCode }),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.requires_2fa) {
          setRequires2FA(true)
          setUserData(data.user || null)
        } else {
          // Authentication successful, store token and redirect
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))

          // Set cookie for middleware
          document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days

          router.push('/tools')
        }
      } else {
        setError(data.message || 'Authentication failed')
      }
    } catch (err) {
      console.error('Authentication error:', err)
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (twoFactorCode.length === 6) {
      authenticateUser(twoFactorCode)
    }
  }

  if (!requires2FA && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Authenticating...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit code from your authenticator app
          </p>
          {userData && (
            <p className="mt-2 text-center text-sm text-gray-500">
              Signing in as: {userData.email}
            </p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700">
              Authentication Code
            </label>
            <input
              id="twoFactorCode"
              name="twoFactorCode"
              type="text"
              required
              maxLength={6}
              pattern="[0-9]{6}"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center text-2xl tracking-widest text-gray-900"
              placeholder="000000"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              autoComplete="one-time-code"
              autoFocus
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || twoFactorCode.length !== 6}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}