'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/admin-api'
import { Table, TableColumn, TablePagination } from '@/components/admin/Table'
// Simple icons
const ClockIcon = ({ className }: { className?: string }) => <span className={className}>🕐</span>
const CheckCircleIcon = ({ className }: { className?: string }) => <span className={className}>✅</span>
const XCircleIcon = ({ className }: { className?: string }) => <span className={className}>❌</span>
const PencilIcon = ({ className }: { className?: string }) => <span className={className}>✏️</span>
const TrashIcon = ({ className }: { className?: string }) => <span className={className}>🗑️</span>
const DocumentTextIcon = ({ className }: { className?: string }) => <span className={className}>📄</span>
const FunnelIcon = ({ className }: { className?: string }) => <span className={className}>🔽</span>
const XMarkIcon = ({ className }: { className?: string }) => <span className={className}>❌</span>

interface Activity {
  id: number
  log_name: string
  description: string
  subject_type: string
  subject_id: number
  event: string
  causer: {
    id: number
    name: string
    email: string
  } | null
  properties: any
  created_at: string
  updated_at: string
}

interface AuditLogResponse {
  data: Activity[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export default function AuditLogPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [meta, setMeta] = useState<AuditLogResponse['meta'] | null>(null)
  const [loading, setLoading] = useState(true)

  // Filters
  const [filters, setFilters] = useState({
    subject_type: '',
    event: '',
    date_from: '',
    date_to: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const eventTypes = [
    { value: '', label: 'All Events' },
    { value: 'created', label: 'Created' },
    { value: 'updated', label: 'Updated' },
    { value: 'deleted', label: 'Deleted' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ]

  const subjectTypes = [
    { value: '', label: 'All Types' },
    { value: 'App\\Models\\Tool', label: 'Tools' },
    { value: 'App\\Models\\Category', label: 'Categories' },
    { value: 'App\\Models\\User', label: 'Users' },
  ]

  useEffect(() => {
    fetchActivities()
  }, [filters, currentPage])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage,
        per_page: 20,
      }

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params[key] = value
        }
      })

      const response = await adminApi.getActivities(params)
      setActivities(response.data)
      setMeta({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
      })
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filtering
  }

  const clearFilters = () => {
    setFilters({
      subject_type: '',
      event: '',
      date_from: '',
      date_to: '',
    })
    setCurrentPage(1)
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  const getEventIcon = (description: string, event: string) => {
    if (description.includes('approved') || event === 'approved') {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />
    }
    if (description.includes('rejected') || event === 'rejected') {
      return <XCircleIcon className="h-5 w-5 text-red-500" />
    }
    if (description.includes('created') || event === 'created') {
      return <DocumentTextIcon className="h-5 w-5 text-blue-500" />
    }
    if (description.includes('updated') || event === 'updated') {
      return <PencilIcon className="h-5 w-5 text-yellow-500" />
    }
    if (description.includes('deleted') || event === 'deleted') {
      return <TrashIcon className="h-5 w-5 text-red-500" />
    }
    return <ClockIcon className="h-5 w-5 text-gray-500" />
  }

  const formatSubjectType = (subjectType: string) => {
    const typeMap: Record<string, string> = {
      'App\\Models\\Tool': 'Tool',
      'App\\Models\\Category': 'Category',
      'App\\Models\\User': 'User',
    }
    return typeMap[subjectType] || subjectType
  }

  const getEventBadgeColor = (description: string, event: string) => {
    if (description.includes('approved') || event === 'approved') {
      return 'bg-green-100 text-green-800'
    }
    if (description.includes('rejected') || event === 'rejected') {
      return 'bg-red-100 text-red-800'
    }
    if (description.includes('created') || event === 'created') {
      return 'bg-blue-100 text-blue-800'
    }
    if (description.includes('updated') || event === 'updated') {
      return 'bg-yellow-100 text-yellow-800'
    }
    if (description.includes('deleted') || event === 'deleted') {
      return 'bg-red-100 text-red-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  const columns: TableColumn<Activity>[] = [
    {
      key: 'activity',
      header: 'Activity',
      cell: (activity) => (
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getEventIcon(activity.description, activity.event)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900">
              {activity.description}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getEventBadgeColor(activity.description, activity.event)}`}>
                {activity.event || 'unknown'}
              </span>
              <span className="text-xs text-gray-500">
                {formatSubjectType(activity.subject_type)} #{activity.subject_id}
              </span>
            </div>
            {activity.properties?.reason && (
              <div className="mt-1 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                <strong>Reason:</strong> {activity.properties.reason}
              </div>
            )}
            {activity.properties?.status && (
              <div className="mt-1 text-xs text-gray-600">
                <strong>Status:</strong> {activity.properties.status}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'causer',
      header: 'User',
      cell: (activity) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {activity.causer?.name || 'System'}
          </div>
          <div className="text-sm text-gray-500">
            {activity.causer?.email || 'system@example.com'}
          </div>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Date & Time',
      cell: (activity) => (
        <div>
          <div className="text-sm text-gray-900">
            {new Date(activity.created_at).toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(activity.created_at).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track all system activities and changes
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            hasActiveFilters
              ? 'text-indigo-700 bg-indigo-50 border-indigo-300'
              : 'text-gray-700 bg-white hover:bg-gray-50'
          }`}
        >
          <FunnelIcon className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Type
              </label>
              <select
                value={filters.subject_type}
                onChange={(e) => handleFilterChange('subject_type', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {subjectTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type
              </label>
              <select
                value={filters.event}
                onChange={(e) => handleFilterChange('event', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {eventTypes.map(event => (
                  <option key={event.value} value={event.value}>
                    {event.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500">Active filters:</span>
                {filters.subject_type && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Type: {subjectTypes.find(t => t.value === filters.subject_type)?.label}
                    <button
                      onClick={() => handleFilterChange('subject_type', '')}
                      className="ml-1 inline-flex items-center p-0.5 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.event && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Event: {eventTypes.find(e => e.value === filters.event)?.label}
                    <button
                      onClick={() => handleFilterChange('event', '')}
                      className="ml-1 inline-flex items-center p-0.5 rounded-full text-green-400 hover:bg-green-200 hover:text-green-600"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.date_from && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    From: {filters.date_from}
                    <button
                      onClick={() => handleFilterChange('date_from', '')}
                      className="ml-1 inline-flex items-center p-0.5 rounded-full text-yellow-400 hover:bg-yellow-200 hover:text-yellow-600"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.date_to && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    To: {filters.date_to}
                    <button
                      onClick={() => handleFilterChange('date_to', '')}
                      className="ml-1 inline-flex items-center p-0.5 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-600"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>

              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      <Table
        columns={columns}
        data={activities}
        loading={loading}
        emptyMessage="No audit log entries found"
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
    </div>
  )
}