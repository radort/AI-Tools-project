'use client'

import { useState } from 'react'
// Simple icons
const MagnifyingGlassIcon = ({ className }: { className?: string }) => <span className={className}>🔍</span>
const FunnelIcon = ({ className }: { className?: string }) => <span className={className}>🔽</span>
const XMarkIcon = ({ className }: { className?: string }) => <span className={className}>❌</span>
import { Dropdown, DropdownOption } from './Dropdown'

export interface FilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: string | number | null
  onCategoryChange: (category: string | number) => void
  selectedDifficulty: string | null
  onDifficultyChange: (difficulty: string) => void
  selectedStatus?: string | null
  onStatusChange?: (status: string) => void
  categories: DropdownOption[]
  showStatus?: boolean
  placeholder?: string
}

const difficultyOptions: DropdownOption[] = [
  { value: '', label: 'All Difficulties' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const statusOptions: DropdownOption[] = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedStatus,
  onStatusChange,
  categories,
  showStatus = false,
  placeholder = 'Search tools...',
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasActiveFilters = selectedCategory || selectedDifficulty || selectedStatus

  const clearAllFilters = () => {
    onCategoryChange('')
    onDifficultyChange('')
    if (onStatusChange) onStatusChange('')
  }

  const categoryOptions: DropdownOption[] = [
    { value: '', label: 'All Categories' },
    ...categories,
  ]

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 py-4 sm:px-6">
        {/* Search Bar */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder={placeholder}
              aria-label="Search tools"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              hasActiveFilters
                ? 'text-indigo-700 bg-indigo-50 border-indigo-300'
                : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
            aria-expanded={isExpanded}
            aria-label="Toggle filters"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Active
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label="Clear all filters"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Clear
            </button>
          )}
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Dropdown
              value={selectedCategory}
              onChange={onCategoryChange}
              options={categoryOptions}
              placeholder="All Categories"
              label="Category"
            />

            <Dropdown
              value={selectedDifficulty || ''}
              onChange={onDifficultyChange}
              options={difficultyOptions}
              placeholder="All Difficulties"
              label="Difficulty"
            />

            {showStatus && onStatusChange && (
              <Dropdown
                value={selectedStatus || ''}
                onChange={onStatusChange}
                options={statusOptions}
                placeholder="All Status"
                label="Status"
              />
            )}
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">Active filters:</span>

            {selectedCategory && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Category: {categories.find(c => c.value === selectedCategory)?.label}
                <button
                  type="button"
                  onClick={() => onCategoryChange('')}
                  className="ml-1 inline-flex items-center p-0.5 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none focus:bg-blue-500 focus:text-white"
                  aria-label="Remove category filter"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedDifficulty && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Difficulty: {selectedDifficulty}
                <button
                  type="button"
                  onClick={() => onDifficultyChange('')}
                  className="ml-1 inline-flex items-center p-0.5 rounded-full text-green-400 hover:bg-green-200 hover:text-green-600 focus:outline-none focus:bg-green-500 focus:text-white"
                  aria-label="Remove difficulty filter"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedStatus && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Status: {selectedStatus}
                <button
                  type="button"
                  onClick={() => onStatusChange?.('')}
                  className="ml-1 inline-flex items-center p-0.5 rounded-full text-yellow-400 hover:bg-yellow-200 hover:text-yellow-600 focus:outline-none focus:bg-yellow-500 focus:text-white"
                  aria-label="Remove status filter"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}