'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/lib/admin-auth'

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

export default function AdminSecurityPage() {
  const { admin } = useAdminAuth()
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
    loadTwoFactorStatus()
  }, [])

  const loadTwoFactorStatus = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch('/api/admin/two-factor/status', {
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
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/two-factor/generate', {
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
      const token = localStorage.getItem('admin_token')
      console.log('Admin 2FA confirm - token:', token ? 'exists' : 'missing')
      console.log('Admin 2FA confirm - code:', verificationCode)

      const response = await fetch('/api/admin/two-factor/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code: verificationCode }),
      })

      console.log('Admin 2FA confirm response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Admin 2FA confirm success:', data)
        setRecoveryCodes(data.recovery_codes)
        setShowRecoveryCodes(true)
        setSuccess('2FA has been enabled successfully!')
        setShowSetup(false)
        setVerificationCode('')
        loadTwoFactorStatus()
      } else {
        const errorData = await response.json()
        console.log('Admin 2FA confirm error:', errorData)
        setError(errorData.message || 'Invalid verification code')
      }
    } catch (error) {
      console.error('Admin 2FA confirm network error:', error)
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
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/two-factor/disable', {
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
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/two-factor/recovery-codes', {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your admin account security and two-factor authentication
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Account Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Account Information</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Your current admin account details</p>
          </div>
          <div className="mt-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{admin?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{admin?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1 text-sm text-gray-900">{admin?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Two-Factor Authentication</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Add an extra layer of security to your admin account with 2FA</p>
          </div>

          {twoFactorStatus ? (
            <div className="mt-5">
              <div className="flex items-center mb-4">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  twoFactorStatus.enabled && twoFactorStatus.confirmed ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium">
                  Status: {twoFactorStatus.enabled && twoFactorStatus.confirmed ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              {twoFactorStatus.enabled && twoFactorStatus.confirmed && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Two-factor authentication is enabled for your account.
                        You have {twoFactorStatus.recovery_codes_count} recovery codes remaining.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!twoFactorStatus.enabled || !twoFactorStatus.confirmed ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Two-factor authentication is not enabled. Enable 2FA to secure your admin account.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={generate2FA}
                    disabled={actionLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
                  >
                    {actionLoading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-medium text-gray-900 mb-3">Disable Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Enter your password to disable 2FA for your account.
                    </p>
                    <div className="flex space-x-3">
                      <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                      <button
                        onClick={disable2FA}
                        disabled={actionLoading || !password}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
                      >
                        Disable 2FA
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-medium text-gray-900 mb-3">Generate New Recovery Codes</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Generate new recovery codes if you've lost your existing ones. This will invalidate your current recovery codes.
                    </p>
                    <div className="flex space-x-3">
                      <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                      <button
                        onClick={generateNewRecoveryCodes}
                        disabled={actionLoading || !password}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
                      >
                        Generate New Codes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-5">
              <div className="text-sm text-gray-600">Loading 2FA status...</div>
            </div>
          )}
        </div>
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

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowSetup(false)
                  setSetupData(null)
                  setVerificationCode('')
                  setError('')
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirm2FA}
                disabled={actionLoading || verificationCode.length !== 6}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
            >
              I've saved my recovery codes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}