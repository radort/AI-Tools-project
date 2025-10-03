'use client'

import { ReactNode } from 'react'
// Simple icons
const CubeIcon = () => <span className="text-lg">📦</span>
const ClockIcon = () => <span className="text-lg">🕐</span>
const CheckCircleIcon = () => <span className="text-lg">✅</span>
const XCircleIcon = () => <span className="text-lg">❌</span>
const UsersIcon = () => <span className="text-lg">👥</span>

// Export trending icons in case they're referenced elsewhere
export const TrendingUpIcon = ({ className }: { className?: string }) => <span className={className}>📈</span>
export const TrendingDownIcon = ({ className }: { className?: string }) => <span className={className}>📉</span>

export interface StatTileProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    value: number
    direction: 'up' | 'down'
    label: string
  }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray'
  loading?: boolean
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    text: 'text-blue-900',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    text: 'text-green-900',
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    text: 'text-yellow-900',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    text: 'text-red-900',
  },
  gray: {
    bg: 'bg-gray-50',
    icon: 'text-gray-600',
    text: 'text-gray-900',
  },
}

export function StatTile({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'gray',
  loading = false,
}: StatTileProps) {
  const classes = colorClasses[color]

  if (loading) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 ${classes.bg} rounded-md animate-pulse`} />
            </div>
            <div className="ml-5 w-0 flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon && (
              <div className={`w-8 h-8 ${classes.bg} rounded-md flex items-center justify-center`}>
                <div className={`w-5 h-5 ${classes.icon}`}>
                  {icon}
                </div>
              </div>
            )}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className={`text-2xl font-semibold ${classes.text}`}>
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend.direction === 'up' ? (
                      <TrendingUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                    )}
                    <span className="ml-1">
                      {trend.value}%
                    </span>
                    <span className="sr-only">
                      {trend.direction === 'up' ? 'Increased' : 'Decreased'} by {trend.value}%
                    </span>
                  </div>
                )}
              </dd>
              {subtitle && (
                <dd className="text-sm text-gray-500 mt-1">
                  {subtitle}
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

export interface StatsGridProps {
  stats: Array<StatTileProps & { id: string }>
  loading?: boolean
}

export function StatsGrid({ stats, loading = false }: StatsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatTile
            key={i}
            title=""
            value=""
            loading={true}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatTile
          key={stat.id}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          trend={stat.trend}
          color={stat.color}
        />
      ))}
    </div>
  )
}

// Pre-configured stat tiles for common metrics
export const statIcons = {
  tools: <CubeIcon />,
  pending: <ClockIcon />,
  approved: <CheckCircleIcon />,
  rejected: <XCircleIcon />,
  users: <UsersIcon />,
}

export function createToolsStats(data: {
  total_tools: number
  pending_tools: number
  approved_tools: number
  rejected_tools: number
}): Array<StatTileProps & { id: string }> {
  return [
    {
      id: 'total-tools',
      title: 'Total Tools',
      value: data.total_tools,
      icon: statIcons.tools,
      color: 'blue',
    },
    {
      id: 'pending-tools',
      title: 'Pending Review',
      value: data.pending_tools,
      icon: statIcons.pending,
      color: 'yellow',
    },
    {
      id: 'approved-tools',
      title: 'Approved',
      value: data.approved_tools,
      icon: statIcons.approved,
      color: 'green',
    },
    {
      id: 'rejected-tools',
      title: 'Rejected',
      value: data.rejected_tools,
      icon: statIcons.rejected,
      color: 'red',
    },
  ]
}