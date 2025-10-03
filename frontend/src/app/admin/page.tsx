'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminRootPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard by default
    router.push('/admin/dashboard')
  }, [router])

  return null
}