'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { adminApi, Tool } from '@/lib/admin-api'
import { api } from '@/lib/api'
import { Table, TableColumn, TablePagination } from '@/components/admin/Table'
import { FilterBar } from '@/components/FilterBar'
import { Modal, ModalBody, ModalFooter } from '@/components/Modal'
import { Toast, ToastContainer } from '@/components/Toast'
// Simple icons
const CheckCircleIcon = ({ className }: { className?: string }) => <span className={className}>✅</span>
const XCircleIcon = ({ className }: { className?: string }) => <span className={className}>❌</span>
const ClockIcon = ({ className }: { className?: string }) => <span className={className}>🕐</span>
const EyeIcon = ({ className }: { className?: string }) => <span className={className}>👁️</span>
const ExclamationTriangleIcon = ({ className }: { className?: string }) => <span className={className}>⚠️</span>

interface AdminToolsResponse {
  data: Tool[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

interface ToastState {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  show: boolean
}

export default function AdminToolsPage() {
  const searchParams = useSearchParams()
  const [tools, setTools] = useState<Tool[]>([])
  const [meta, setMeta] = useState<AdminToolsResponse['meta'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | number | null>(
    searchParams.get('category') || ''
  )
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    searchParams.get('difficulty') || ''
  )
  const [selectedStatus, setSelectedStatus] = useState<string | null>(
    searchParams.get('status') || ''
  )
  const [currentPage, setCurrentPage] = useState(1)

  // Modals
  const [approveModal, setApproveModal] = useState<{
    isOpen: boolean
    tool: Tool | null
  }>({ isOpen: false, tool: null })

  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean
    tool: Tool | null
  }>({ isOpen: false, tool: null })

  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Toasts
  const [toasts, setToasts] = useState<ToastState[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchTools()
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedStatus, currentPage])

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories()
      setCategories(response.data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchTools = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage,
        per_page: 15,
      }

      if (searchQuery) params.search = searchQuery
      if (selectedCategory) params.category_id = selectedCategory
      if (selectedDifficulty) params.difficulty = selectedDifficulty
      if (selectedStatus) params.status = selectedStatus

      console.log('🔥 Fetching tools with params:', params)
      const response = await adminApi.getTools(params)
      console.log('🔥 Tools fetched:', response.data.length, 'tools')
      console.log('🔥 Tool statuses:', response.data.map(tool => ({ id: tool.id, name: tool.name, status: tool.status })))
      setTools(response.data)
      setMeta({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
      })
    } catch (error) {
      console.error('🔥 Failed to fetch tools:', error)
      showToast('error', 'Error', 'Failed to load tools')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (
    type: ToastState['type'],
    title: string,
    message?: string
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: ToastState = {
      id,
      type,
      title,
      message,
      show: true,
    }
    setToasts((prev) => [...prev, toast])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const handleApprove = async () => {
    if (!approveModal.tool) return

    try {
      setActionLoading(true)
      console.log('🔥 Approving tool:', approveModal.tool.id)
      await adminApi.approveTool(approveModal.tool.id)
      console.log('🔥 Tool approved successfully')
      showToast('success', 'Tool Approved', `${approveModal.tool.name} has been approved`)
      setApproveModal({ isOpen: false, tool: null })
      fetchTools()
    } catch (error) {
      console.error('🔥 Failed to approve tool:', error)
      showToast('error', 'Error', 'Failed to approve tool')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectModal.tool || !rejectReason.trim()) return

    try {
      setActionLoading(true)
      console.log('🔥 Rejecting tool:', rejectModal.tool.id, 'with reason:', rejectReason.trim())
      await adminApi.rejectTool(rejectModal.tool.id, rejectReason.trim())
      console.log('🔥 Tool rejected successfully')
      showToast('success', 'Tool Rejected', `${rejectModal.tool.name} has been rejected`)
      setRejectModal({ isOpen: false, tool: null })
      setRejectReason('')
      fetchTools()
    } catch (error) {
      console.error('🔥 Failed to reject tool:', error)
      showToast('error', 'Error', 'Failed to reject tool')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { icon: ClockIcon, color: 'bg-yellow-100 text-yellow-800' },
      approved: { icon: CheckCircleIcon, color: 'bg-green-100 text-green-800' },
      rejected: { icon: XCircleIcon, color: 'bg-red-100 text-red-800' },
    }

    const config = configs[status as keyof typeof configs]
    if (!config) return null

    const Icon = config.icon
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    )
  }

  const columns: TableColumn<Tool>[] = [
    {
      key: 'name',
      header: 'Tool',
      cell: (tool) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{tool.name}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {tool.description}
          </div>
        </div>
      ),
    },
    {
      key: 'creator',
      header: 'Creator',
      cell: (tool) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{tool.creator.name}</div>
          <div className="text-sm text-gray-500">{tool.creator.email}</div>
        </div>
      ),
    },
    {
      key: 'categories',
      header: 'Categories',
      cell: (tool) => (
        <div className="flex flex-wrap gap-1">
          {tool.categories.slice(0, 2).map((category) => (
            <span
              key={category.id}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
            >
              {category.name}
            </span>
          ))}
          {tool.categories.length > 2 && (
            <span className="text-xs text-gray-500">
              +{tool.categories.length - 2} more
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'difficulty',
      header: 'Difficulty',
      cell: (tool) => {
        const colors = {
          beginner: 'bg-green-100 text-green-800',
          intermediate: 'bg-yellow-100 text-yellow-800',
          advanced: 'bg-red-100 text-red-800',
        }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[tool.difficulty]}`}>
            {tool.difficulty}
          </span>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      cell: (tool) => getStatusBadge(tool.status),
    },
    {
      key: 'created_at',
      header: 'Created',
      cell: (tool) => (
        <div className="text-sm text-gray-900">
          {new Date(tool.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (tool) => (
        <div className="flex items-center space-x-2">
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-900"
            title="View tool"
          >
            <EyeIcon className="h-4 w-4" />
          </a>

          {tool.status === 'pending' && (
            <>
              <button
                onClick={() => setApproveModal({ isOpen: true, tool })}
                className="text-green-600 hover:text-green-900"
                title="Approve tool"
              >
                <CheckCircleIcon className="h-4 w-4" />
              </button>

              <button
                onClick={() => setRejectModal({ isOpen: true, tool })}
                className="text-red-600 hover:text-red-900"
                title="Reject tool"
              >
                <XCircleIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tools Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review and manage tool submissions
        </p>
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        categories={categoryOptions}
        showStatus={true}
        placeholder="Search tools by name or description..."
      />

      <Table
        columns={columns}
        data={tools}
        loading={loading}
        emptyMessage="No tools found"
      />

      {meta && (
        <TablePagination
          currentPage={meta.current_page}
          totalPages={meta.last_page}
          totalItems={meta.total}
          itemsPerPage={meta.per_page}
          onPageChange={setCurrentPage}
          loading={loading}
        />
      )}

      {/* Approve Modal */}
      <Modal
        isOpen={approveModal.isOpen}
        onClose={() => setApproveModal({ isOpen: false, tool: null })}
        title="Approve Tool"
        size="md"
      >
        <ModalBody>
          <div className="flex items-center">
            <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-900">
                Are you sure you want to approve{' '}
                <strong>{approveModal.tool?.name}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This will make the tool visible to all users.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            onClick={() => setApproveModal({ isOpen: false, tool: null })}
            disabled={actionLoading}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={actionLoading}
            className="bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {actionLoading ? 'Approving...' : 'Approve'}
          </button>
        </ModalFooter>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.isOpen}
        onClose={() => {
          setRejectModal({ isOpen: false, tool: null })
          setRejectReason('')
        }}
        title="Reject Tool"
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-900">
                  Reject <strong>{rejectModal.tool?.name}</strong>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Please provide a reason for rejection.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="reject-reason" className="block text-sm font-medium text-gray-700">
                Rejection Reason
              </label>
              <textarea
                id="reject-reason"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Explain why this tool is being rejected..."
                required
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            onClick={() => {
              setRejectModal({ isOpen: false, tool: null })
              setRejectReason('')
            }}
            disabled={actionLoading}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={actionLoading || !rejectReason.trim()}
            className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {actionLoading ? 'Rejecting...' : 'Reject'}
          </button>
        </ModalFooter>
      </Modal>

      {/* Toast Container */}
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            show={toast.show}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </ToastContainer>
    </div>
  )
}