'use client'

export interface Admin {
  id: number
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'moderator'
  last_login_at: string | null
}

export interface AdminLoginResponse {
  admin: Admin
  token: string
}

export interface AdminStatsResponse {
  total_tools: number
  pending_tools: number
  approved_tools: number
  rejected_tools: number
  total_users: number
  recent_activity: any[]
}

export interface Tool {
  id: number
  name: string
  description: string
  url: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  creator: {
    id: number
    name: string
    email: string
  }
  categories: Array<{
    id: number
    name: string
  }>
  approver?: {
    id: number
    name: string
    email: string
  }
  rejection_reason?: string
  approved_at?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

class AdminApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    // Use the frontend API proxy instead of direct backend access
    this.baseUrl = ''
  }

  setToken(token: string) {
    this.token = token
  }

  clearToken() {
    this.token = null
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    return headers
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `/api/admin${endpoint}`

    console.log('🔥 Admin API request:', {
      url,
      method: options.method || 'GET',
      hasToken: !!this.token,
      tokenPreview: this.token ? this.token.substring(0, 20) + '...' : 'none'
    })

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    })

    console.log('🔥 Admin API response:', {
      url,
      status: response.status,
      ok: response.ok
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }))
      console.log('🔥 Admin API error:', errorData)
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Authentication
  async login(email: string, password: string): Promise<AdminLoginResponse> {
    return this.request<AdminLoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async logout(): Promise<void> {
    return this.request<void>('/logout', {
      method: 'POST',
    })
  }

  async getCurrentAdmin(): Promise<Admin> {
    const response = await this.request<{ admin: Admin }>('/me')
    return response.admin
  }

  async changePassword(currentPassword: string, newPassword: string, newPasswordConfirmation: string): Promise<void> {
    return this.request<void>('/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      }),
    })
  }

  // Tools management
  async getTools(params?: {
    status?: string
    category_id?: number
    role?: string
    date_from?: string
    date_to?: string
    search?: string
    per_page?: number
    page?: number
  }): Promise<PaginatedResponse<Tool>> {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const queryString = searchParams.toString()
    return this.request<PaginatedResponse<Tool>>(`/tools${queryString ? `?${queryString}` : ''}`)
  }

  async approveTool(toolId: number): Promise<{ message: string; tool: Tool }> {
    return this.request<{ message: string; tool: Tool }>(`/tools/${toolId}/approve`, {
      method: 'POST',
    })
  }

  async rejectTool(toolId: number, reason: string): Promise<{ message: string; tool: Tool }> {
    return this.request<{ message: string; tool: Tool }>(`/tools/${toolId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  // Statistics
  async getStats(): Promise<AdminStatsResponse> {
    return this.request<AdminStatsResponse>('/stats')
  }

  // Activities
  async getActivities(params?: {
    subject_type?: string
    event?: string
    date_from?: string
    date_to?: string
    per_page?: number
    page?: number
  }): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const queryString = searchParams.toString()
    return this.request<PaginatedResponse<any>>(`/activities${queryString ? `?${queryString}` : ''}`)
  }
}

export const adminApi = new AdminApiClient()