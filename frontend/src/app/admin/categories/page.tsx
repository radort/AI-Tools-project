'use client'

import { useEffect, useState } from 'react'
import { api, Category } from '@/lib/api'
import { Table, TableColumn } from '@/components/admin/Table'
import { Modal, ModalBody, ModalFooter } from '@/components/Modal'
import { Toast, ToastContainer } from '@/components/Toast'
// Simple icons
const PlusIcon = ({ className }: { className?: string }) => <span className={className}>➕</span>
const PencilIcon = ({ className }: { className?: string }) => <span className={className}>✏️</span>
const TrashIcon = ({ className }: { className?: string }) => <span className={className}>🗑️</span>
const TagIcon = ({ className }: { className?: string }) => <span className={className}>🏷️</span>

interface ToastState {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  show: boolean
}

interface CategoryFormData {
  name: string
  slug: string
  description: string
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState<ToastState[]>([])

  // Form state
  const [formModal, setFormModal] = useState<{
    isOpen: boolean
    category: Category | null
    isEdit: boolean
  }>({ isOpen: false, category: null, isEdit: false })

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    category: Category | null
  }>({ isOpen: false, category: null })

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
  })

  const [formErrors, setFormErrors] = useState<Partial<CategoryFormData>>({})
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await api.getCategories()
      setCategories(response.data)
    } catch (error) {
      showToast('error', 'Error', 'Failed to load categories')
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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const validateForm = (): boolean => {
    const errors: Partial<CategoryFormData> = {}

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }

    if (!formData.slug.trim()) {
      errors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const openAddModal = () => {
    setFormData({ name: '', slug: '', description: '' })
    setFormErrors({})
    setFormModal({ isOpen: true, category: null, isEdit: false })
  }

  const openEditModal = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    })
    setFormErrors({})
    setFormModal({ isOpen: true, category, isEdit: true })
  }

  const closeFormModal = () => {
    setFormModal({ isOpen: false, category: null, isEdit: false })
    setFormData({ name: '', slug: '', description: '' })
    setFormErrors({})
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setActionLoading(true)

      if (formModal.isEdit && formModal.category) {
        // Edit category (API endpoint would need to be implemented)
        showToast('info', 'Note', 'Edit functionality needs backend implementation')
      } else {
        // Create category
        await api.createCategory(formData)
        showToast('success', 'Category Created', `${formData.name} has been created`)
        fetchCategories()
        closeFormModal()
      }
    } catch (error) {
      showToast('error', 'Error', `Failed to ${formModal.isEdit ? 'update' : 'create'} category`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.category) return

    try {
      setActionLoading(true)
      // Delete API endpoint would need to be implemented
      showToast('info', 'Note', 'Delete functionality needs backend implementation')
      setDeleteModal({ isOpen: false, category: null })
    } catch (error) {
      showToast('error', 'Error', 'Failed to delete category')
    } finally {
      setActionLoading(false)
    }
  }

  const columns: TableColumn<Category>[] = [
    {
      key: 'name',
      header: 'Category',
      cell: (category) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <TagIcon className="h-4 w-4 text-indigo-600" />
            </div>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{category.name}</div>
            <div className="text-sm text-gray-500">/{category.slug}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      cell: (category) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {category.description || 'No description'}
        </div>
      ),
    },
    {
      key: 'tools_count',
      header: 'Tools',
      cell: (category) => (
        <div className="text-sm text-gray-900">
          {category.tools_count || 0} tools
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      cell: (category) => (
        <div className="text-sm text-gray-900">
          {new Date(category.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (category) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openEditModal(category)}
            className="text-indigo-600 hover:text-indigo-900"
            title="Edit category"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteModal({ isOpen: true, category })}
            className="text-red-600 hover:text-red-900"
            title="Delete category"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage tool categories and organization
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Category
        </button>
      </div>

      <Table
        columns={columns}
        data={categories}
        loading={loading}
        emptyMessage="No categories found"
      />

      {/* Form Modal */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={closeFormModal}
        title={formModal.isEdit ? 'Edit Category' : 'Add Category'}
        size="md"
      >
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="category-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  formErrors.name ? 'border-red-300' : ''
                }`}
                placeholder="e.g., AI Tools"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="category-slug" className="block text-sm font-medium text-gray-700">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                id="category-slug"
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                  formErrors.slug ? 'border-red-300' : ''
                }`}
                placeholder="ai-tools"
              />
              {formErrors.slug && (
                <p className="mt-1 text-sm text-red-600">{formErrors.slug}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                URL-friendly version of the name. Only lowercase letters, numbers, and hyphens.
              </p>
            </div>

            <div>
              <label htmlFor="category-description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="category-description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Brief description of this category..."
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            onClick={closeFormModal}
            disabled={actionLoading}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={actionLoading}
            className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {actionLoading ? 'Saving...' : formModal.isEdit ? 'Update' : 'Create'}
          </button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, category: null })}
        title="Delete Category"
        size="md"
      >
        <ModalBody>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrashIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-900">
                Are you sure you want to delete{' '}
                <strong>{deleteModal.category?.name}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This action cannot be undone. Tools in this category will need to be reassigned.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            onClick={() => setDeleteModal({ isOpen: false, category: null })}
            disabled={actionLoading}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={actionLoading}
            className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {actionLoading ? 'Deleting...' : 'Delete'}
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