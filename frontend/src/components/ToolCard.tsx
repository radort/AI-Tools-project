'use client'

import Link from 'next/link'
import { Tool } from '@/lib/api'
// Simple icons
const EyeIcon = ({ className }: { className?: string }) => <span className={className}>👁️</span>
const PencilIcon = ({ className }: { className?: string }) => <span className={className}>✏️</span>
const TrashIcon = ({ className }: { className?: string }) => <span className={className}>🗑️</span>
const ExternalLinkIcon = ({ className }: { className?: string }) => <span className={className}>🔗</span>
const DocumentTextIcon = ({ className }: { className?: string }) => <span className={className}>📄</span>
const PlayIcon = ({ className }: { className?: string }) => <span className={className}>▶️</span>
const ClockIcon = ({ className }: { className?: string }) => <span className={className}>🕐</span>
const CheckCircleIcon = ({ className }: { className?: string }) => <span className={className}>✅</span>
const XCircleIcon = ({ className }: { className?: string }) => <span className={className}>❌</span>
const ExclamationTriangleIcon = ({ className }: { className?: string }) => <span className={className}>⚠️</span>

export interface ToolCardProps {
  tool: Tool
  onEdit?: (tool: Tool) => void
  onDelete?: (tool: Tool) => void
  onApprove?: (tool: Tool) => void
  onReject?: (tool: Tool) => void
  showActions?: boolean
  showStatus?: boolean
  compact?: boolean
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const statusIcons = {
  pending: ClockIcon,
  approved: CheckCircleIcon,
  rejected: XCircleIcon,
}

export function ToolCard({
  tool,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  showActions = false,
  showStatus = false,
  compact = false,
}: ToolCardProps) {
  const StatusIcon = statusIcons[tool.status]

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              <Link href={tool.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">
                {tool.name}
              </Link>
            </h3>
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">{tool.description}</p>
            <div className="mt-2 flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColors[tool.difficulty]}`}>
                {tool.difficulty}
              </span>
              {showStatus && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[tool.status]}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {tool.status}
                </span>
              )}
            </div>
          </div>
          {showActions && (
            <div className="flex items-center space-x-1 ml-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(tool)}
                  className="p-1 text-gray-400 hover:text-indigo-500"
                  aria-label="Edit tool"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(tool)}
                  className="p-1 text-gray-400 hover:text-red-500"
                  aria-label="Delete tool"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {tool.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{tool.description}</p>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {tool.categories.map((category) => (
                  <span
                    key={category.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {category.name}
                  </span>
                ))}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyColors[tool.difficulty]}`}>
                  {tool.difficulty}
                </span>
                {showStatus && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[tool.status]}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {tool.status}
                  </span>
                )}
              </div>
            </div>

            {tool.rejection_reason && tool.status === 'rejected' && (
              <div className="mt-3 p-3 bg-red-50 rounded-md">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-2">
                    <h4 className="text-sm font-medium text-red-800">Rejection Reason</h4>
                    <p className="text-sm text-red-700">{tool.rejection_reason}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center text-sm text-gray-500">
              <span>Created by {tool.creator.name}</span>
              <span className="mx-2">•</span>
              <span>{new Date(tool.created_at).toLocaleDateString()}</span>
              {tool.approved_at && tool.approver && (
                <>
                  <span className="mx-2">•</span>
                  <span>Approved by {tool.approver.name}</span>
                </>
              )}
            </div>
          </div>

          {showStatus && (
            <div className="ml-4">
              <StatusIcon className={`w-6 h-6 ${
                tool.status === 'approved' ? 'text-green-500' :
                tool.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'
              }`} />
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ExternalLinkIcon className="w-4 h-4 mr-2" />
              Visit Tool
            </Link>

            {tool.docs_url && (
              <Link
                href={tool.docs_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Docs
              </Link>
            )}

            {tool.video_url && (
              <Link
                href={tool.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlayIcon className="w-4 h-4 mr-2" />
                Video
              </Link>
            )}
          </div>

          {showActions && (
            <div className="flex items-center space-x-2">
              {tool.status === 'pending' && onApprove && (
                <button
                  onClick={() => onApprove(tool)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Approve
                </button>
              )}

              {tool.status === 'pending' && onReject && (
                <button
                  onClick={() => onReject(tool)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <XCircleIcon className="w-4 h-4 mr-2" />
                  Reject
                </button>
              )}

              {onEdit && (
                <button
                  onClick={() => onEdit(tool)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => onDelete(tool)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}