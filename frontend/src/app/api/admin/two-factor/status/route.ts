import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://backend:80'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json({ message: 'No authorization header' }, { status: 401 })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(`${BACKEND_URL}/api/admin/two-factor/status`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Admin 2FA status proxy error:', error)

    if (error.name === 'AbortError') {
      return NextResponse.json(
        { message: 'Admin 2FA status request timed out. Please try again.' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { message: 'Admin 2FA service temporarily unavailable. Please try again.' },
      { status: 500 }
    )
  }
}