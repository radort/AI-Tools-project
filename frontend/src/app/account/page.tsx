'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User } from '@/lib/api'

interface TwoFactorStatus {
  enabled: boolean
  confirmed: boolean
  recovery_codes_count: number
}

interface SetupResponse {
  secret: string
  qr_code: string
  manual_entry_key: string
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null)
  const [showSetup, setShowSetup] = useState(false)
  const [setupData, setSetupData] = useState<SetupResponse | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [password, setPassword] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!userData || !token) {
      window.location.href = '/login'
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      loadTwoFactorStatus()
    } catch (e) {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    setLoading(false)
  }, [])

  const loadTwoFactorStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch('/api/two-factor/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        setTwoFactorStatus(data)
      } else {
        console.error('Failed to load 2FA status:', response.status, response.statusText)
        // Set a default state if the API fails
        setTwoFactorStatus({
          enabled: false,
          confirmed: false,
          recovery_codes_count: 0
        })
      }
    } catch (error) {
      console.error('Failed to load 2FA status:', error)
      // Set a default state if the API fails
      setTwoFactorStatus({
        enabled: false,
        confirmed: false,
        recovery_codes_count: 0
      })
    }
  }

  const generate2FA = async () => {
    setActionLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/two-factor/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSetupData(data)
        setShowSetup(true)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to generate 2FA setup')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setActionLoading(false)
    }
  }

  const confirm2FA = async () => {
    if (verificationCode.length !== 6) return

    setActionLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/two-factor/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code: verificationCode }),
      })

      if (response.ok) {
        const data = await response.json()
        setRecoveryCodes(data.recovery_codes)
        setShowRecoveryCodes(true)
        setSuccess('2FA has been enabled successfully!')
        setShowSetup(false)
        setVerificationCode('')
        loadTwoFactorStatus()
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Invalid verification code')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setActionLoading(false)
    }
  }

  const disable2FA = async () => {
    if (!password) {
      setError('Password is required')
      return
    }

    setActionLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/two-factor/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        setSuccess('2FA has been disabled successfully!')
        setPassword('')
        loadTwoFactorStatus()
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to disable 2FA')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setActionLoading(false)
    }
  }

  const generateNewRecoveryCodes = async () => {
    if (!password) {
      setError('Password is required')
      return
    }

    setActionLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/two-factor/recovery-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        const data = await response.json()
        setRecoveryCodes(data.recovery_codes)
        setShowRecoveryCodes(true)
        setSuccess('New recovery codes generated successfully!')
        setPassword('')
        loadTwoFactorStatus()
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to generate recovery codes')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
          <Link href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/tools" className="text-xl font-bold text-gray-900">
                AI Tools Hub
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{user.name}</span>
                <span className="ml-2 text-gray-500">({user.role})</span>
              </div>
              <Link
                href="/tools"
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Back to Tools
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account and security settings</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">{user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <p className="mt-1 text-sm text-gray-900">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Two-Factor Authentication</h2>

          {twoFactorStatus ? (
            <div>
              <div className="mb-4">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    twoFactorStatus.enabled && twoFactorStatus.confirmed ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium">
                    {twoFactorStatus.enabled && twoFactorStatus.confirmed ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {twoFactorStatus.enabled && twoFactorStatus.confirmed && (
                  <p className="text-sm text-gray-600 mt-1">
                    You have {twoFactorStatus.recovery_codes_count} recovery codes remaining
                  </p>
                )}
              </div>

              {!twoFactorStatus.enabled || !twoFactorStatus.confirmed ? (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Secure your account with two-factor authentication using an authenticator app.
                  </p>
                  <button
                    onClick={generate2FA}
                    disabled={actionLoading}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                  >
                    {actionLoading ? 'Setting up...' : 'Enable 2FA'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Disable 2FA</h3>
                    <div className="flex space-x-2">
                      <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={disable2FA}
                        disabled={actionLoading || !password}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                      >
                        Disable
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Generate New Recovery Codes</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Generate new recovery codes if you've lost your existing ones.
                    </p>
                    <div className="flex space-x-2">
                      <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={generateNewRecoveryCodes}
                        disabled={actionLoading || !password}
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-600">Loading 2FA status...</div>
          )}
        </div>

        {/* 2FA Setup Modal */}
        {showSetup && setupData && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Set up Two-Factor Authentication</h3>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <div className="flex justify-center mb-4">
                  <img
                    src={`data:image/svg+xml;base64,${setupData.qr_code}`}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Can't scan? Enter this code manually: <code className="bg-gray-100 px-1 rounded">{setupData.manual_entry_key}</code>
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest text-gray-900"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowSetup(false)
                    setSetupData(null)
                    setVerificationCode('')
                    setError('')
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={confirm2FA}
                  disabled={actionLoading || verificationCode.length !== 6}
                  className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                  {actionLoading ? 'Verifying...' : 'Enable 2FA'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recovery Codes Modal */}
        {showRecoveryCodes && recoveryCodes.length > 0 && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recovery Codes</h3>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Save these recovery codes in a safe place. You can use them to access your account if you lose your authenticator device.
                </p>
                <div className="bg-gray-100 p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                    {recoveryCodes.map((code, index) => (
                      <div key={index} className="text-center">{code}</div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-red-600 mt-2">
                  Each code can only be used once. Make sure to keep them secure!
                </p>
              </div>

              <button
                onClick={() => {
                  setShowRecoveryCodes(false)
                  setRecoveryCodes([])
                  setSuccess('')
                }}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                I've saved my recovery codes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}