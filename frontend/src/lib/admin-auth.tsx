'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { adminApi, Admin } from './admin-api'

interface AdminAuthContextType {
  admin: Admin | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

interface AdminAuthProviderProps {
  children: ReactNode
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!admin

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Don't initialize auth if we're on the authenticate page
        // This prevents interference with the intermediate authentication flow
        if (typeof window !== 'undefined' && window.location.pathname === '/admin/authenticate') {
          console.log('Skipping admin auth init on authenticate page')
          setAdmin(null)
          setLoading(false)
          return
        }

        const token = localStorage.getItem('admin_token')
        const adminData = localStorage.getItem('admin_user')

        console.log('🔥 Admin auth init - token:', token ? 'exists' : 'missing')
        console.log('🔥 Admin auth init - adminData:', adminData ? 'exists' : 'missing')

        if (token && adminData) {
          // Use stored admin data instead of making API call
          const admin = JSON.parse(adminData)
          setAdmin(admin)
          adminApi.setToken(token)
          console.log('🔥 Admin auth initialized from localStorage:', admin)
          console.log('🔥 Admin API token set:', token.substring(0, 20) + '...')
        } else {
          console.log('🔥 No admin token or data found')
          console.log('🔥 Token:', token)
          console.log('🔥 AdminData:', adminData)
          setAdmin(null)
        }
      } catch (error) {
        console.error('Failed to initialize admin session:', error)
        setAdmin(null)
      } finally {
        // Always set loading to false regardless of success/failure
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await adminApi.login(email, password)

      // Store admin session separately from user session
      localStorage.setItem('admin_token', response.token)
      localStorage.setItem('admin_user', JSON.stringify(response.admin))

      // Set cookie for middleware
      if (typeof document !== 'undefined') {
        document.cookie = `admin_token=${response.token}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
      }

      adminApi.setToken(response.token)
      setAdmin(response.admin)
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await adminApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')

      // Clear cookie
      if (typeof document !== 'undefined') {
        document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }

      setAdmin(null)
      adminApi.clearToken()
    }
  }

  const value = {
    admin,
    loading,
    login,
    logout,
    isAuthenticated,
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

// Admin route guard component
interface AdminRouteGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function AdminRouteGuard({ children, fallback }: AdminRouteGuardProps) {
  const { admin, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!admin) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-gray-600 mb-4">Access Denied</div>
          <p className="text-gray-500 mb-4">Please log in to access the admin panel.</p>
          <a
            href="/admin/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}