'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/admin-api'
import { StatsGrid, createToolsStats } from '@/components/StatTiles'
import { Table, TableColumn } from '@/components/admin/Table'
// Simple icons
const ClockIcon = ({ className }: { className?: string }) => <span className={className}>🕐</span>
const ExclamationTriangleIcon = ({ className }: { className?: string }) => <span className={className}>⚠️</span>

interface AdminStats {
  total_tools: number
  pending_tools: number
  approved_tools: number
  rejected_tools: number
  total_users: number
  recent_activity: any[]
}

interface RecentActivity {
  id: number
  log_name: string
  description: string
  subject_type: string
  subject_id: number
  causer: {
    name: string
    email: string
  }
  properties: any
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getStats()
      setStats(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  const activityColumns: TableColumn<RecentActivity>[] = [
    {
      key: 'description',
      header: 'Activity',
      cell: (activity) => (
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {activity.log_name === 'default' && activity.description.includes('rejected') ? (
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            ) : (
              <ClockIcon className="h-5 w-5 text-blue-500" />
            )}
          </div>
          <div className="ml-2">
            <div className="text-sm font-medium text-gray-900">
              {activity.description}
            </div>
            {activity.properties?.reason && (
              <div className="text-xs text-gray-500">
                Reason: {activity.properties.reason}
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
      header: 'Date',
      cell: (activity) => (
        <div className="text-sm text-gray-900">
          {new Date(activity.created_at).toLocaleDateString()}
          <div className="text-xs text-gray-500">
            {new Date(activity.created_at).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
  ]

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">
          Error loading dashboard: {error}
        </div>
        <button
          onClick={fetchStats}
          className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of tools, users, and recent activity
        </p>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Statistics</h2>
        {loading || !stats ? (
          <StatsGrid stats={[]} loading={true} />
        ) : (
          <StatsGrid stats={createToolsStats(stats)} />
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Reviews
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.pending_tools || 0} tools waiting
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-3">
              <a
                href="/admin/tools?status=pending"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Review now →
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.total_users || 0}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-sm text-gray-500">All registered users</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Approval Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats
                      ? Math.round((stats.approved_tools / Math.max(stats.total_tools, 1)) * 100)
                      : 0}%
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-sm text-gray-500">
                {stats?.approved_tools || 0} of {stats?.total_tools || 0} tools
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <a
            href="/admin/audit-log"
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            View all →
          </a>
        </div>

        <Table
          columns={activityColumns}
          data={stats?.recent_activity || []}
          loading={loading}
          emptyMessage="No recent activity"
        />
      </div>
    </div>
  )
}