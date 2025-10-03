import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://backend:80'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(`${BACKEND_URL}/api/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Check if response is actually JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('Backend returned non-JSON response:', {
        status: response.status,
        contentType,
        body: text.slice(0, 200)
      })
      return NextResponse.json(
        { message: 'Backend returned invalid response format' },
        { status: 502 }
      )
    }

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Authenticate proxy error:', error)

    if (error.name === 'AbortError') {
      return NextResponse.json(
        { message: 'Authentication request timed out. Please try again.' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { message: 'Authentication service temporarily unavailable. Please try again.' },
      { status: 500 }
    )
  }
}