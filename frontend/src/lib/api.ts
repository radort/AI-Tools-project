const API_BASE_URL = 'http://localhost:8201/api'
const ADMIN_API_BASE_URL = 'http://localhost:8201/api/admin'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    const adminToken = localStorage.getItem('admin_token')

    const authToken = adminToken || token

    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    })

    if (!response.ok) {
      console.log('API request failed:', {
        url,
        status: response.status,
        statusText: response.statusText
      })

      if (response.status === 401) {
        console.log('401 Unauthorized - clearing auth and redirecting to login')
        // Token expired or invalid, clear auth and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Small delay to prevent race conditions
        setTimeout(() => {
          window.location.href = '/login'
        }, 100)
        throw new Error('Unauthorized')
      }

      const errorData = await response.json().catch(() => ({}))
      console.log('API error data:', errorData)
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  private async adminRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${ADMIN_API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    })

    if (!response.ok) {
      console.log('Admin API request failed:', {
        url,
        status: response.status,
        statusText: response.statusText
      })

      if (response.status === 401) {
        console.log('Admin 401 Unauthorized - clearing admin auth and redirecting')
        // Admin token expired or invalid, redirect to admin login
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin')
        window.location.href = '/admin/login'
        throw new Error('Admin authentication required')
      }

      const errorData = await response.json().catch(() => ({}))
      console.log('Admin API error data:', errorData)
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Tools API
  async getTools(params?: {
    category?: number
    role?: number
    difficulty?: string
    search?: string
    page?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `/tools${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    return this.request<{
      data: Tool[]
      meta: {
        current_page: number
        last_page: number
        per_page: number
        total: number
      }
    }>(endpoint)
  }

  async getTool(id: number) {
    return this.request<{ data: Tool }>(`/tools/${id}`)
  }

  async createTool(data: {
    name: string
    description: string
    url: string
    docs_url?: string
    video_url?: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    categories: number[]
    roles: number[]
  }) {
    return this.request<{ data: Tool; message: string }>('/tools', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTool(id: number, data: Partial<{
    name: string
    description: string
    url: string
    docs_url?: string
    video_url?: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    categories: number[]
    roles: number[]
  }>) {
    return this.request<{ data: Tool; message: string }>(`/tools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTool(id: number) {
    return this.request<{ message: string }>(`/tools/${id}`, {
      method: 'DELETE',
    })
  }

  // Categories API
  async getCategories() {
    return this.request<{ data: Category[] }>('/categories')
  }

  async createCategory(data: {
    name: string
    slug: string
    description?: string
  }) {
    return this.request<{ data: Category; message: string }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // User API
  async getCurrentUser() {
    return this.request<User>('/user')
  }

  // Auth API - simplified approach
  async login(email: string, password: string) {
    return this.request<{ user?: User; token?: string; intermediate_token?: string; requires_intermediate_auth?: boolean }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }


  async logout() {
    await this.request<{ message: string }>('/logout', { method: 'POST' })
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Admin API
  async getAdminTools(params?: {
    status?: string
    category_id?: number
    role?: string
    date_from?: string
    date_to?: string
    search?: string
    page?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `/admin/tools${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    return this.request<{
      data: Tool[]
      meta: {
        current_page: number
        last_page: number
        per_page: number
        total: number
      }
    }>(endpoint)
  }

  async approveTool(id: number) {
    return this.request<{ message: string; tool: Tool }>(`/admin/tools/${id}/approve`, {
      method: 'POST',
    })
  }

  async rejectTool(id: number, reason: string) {
    return this.request<{ message: string; tool: Tool }>(`/admin/tools/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async getAdminStats() {
    return this.request<{
      total_tools: number
      pending_tools: number
      approved_tools: number
      rejected_tools: number
      total_users: number
      recent_activity: any[]
    }>('/admin/stats')
  }


  // Stats API
  async getToolCounts() {
    return this.request<Record<string, number>>('/stats/tool-counts')
  }

  async getAdminActivities(params?: {
    subject_type?: string
    event?: string
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const endpoint = `/admin/activities${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    return this.request<{
      data: any[]
      meta: {
        current_page: number
        last_page: number
        per_page: number
        total: number
      }
    }>(endpoint)
  }

  // Admin 2FA API
  async adminLogin(email: string, password: string) {
    return this.adminRequest<{
      admin?: Admin;
      token?: string;
      message?: string
    }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

}

// Types
export interface User {
  id: number
  name: string
  email: string
  role: string
  roles: string[]
}

export interface Admin {
  id: number
  name: string
  email: string
  role: string
  is_active: boolean
  last_login_at: string | null
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  tools_count?: number
  created_at: string
  updated_at: string
}

export interface Role {
  id: number
  name: string
}

export interface Tool {
  id: number
  name: string
  description: string
  url: string
  docs_url?: string
  video_url?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  created_by: number
  approved_by?: number
  approved_at?: string
  creator: {
    id: number
    name: string
    email: string
  }
  categories: Category[]
  roles: Role[]
  approver?: User
  created_at: string
  updated_at: string
}

export const api = new ApiClient(API_BASE_URL)