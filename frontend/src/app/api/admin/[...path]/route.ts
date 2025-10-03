import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://backend:80'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return proxyRequest(request, resolvedParams.path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return proxyRequest(request, resolvedParams.path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return proxyRequest(request, resolvedParams.path, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return proxyRequest(request, resolvedParams.path, 'DELETE')
}

async function proxyRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  try {
    const url = `${BACKEND_URL}/api/admin/${path.join('/')}`
    console.log(`🔥 Proxy request: ${method} ${url}`)

    // Get request body if it exists
    let body: string | undefined
    if (method !== 'GET' && method !== 'DELETE') {
      body = await request.text()
      console.log(`🔥 Request body:`, body)
    }

    // Forward headers
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      // Skip certain headers that might cause issues
      if (!['host', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value
      }
    })
    console.log(`🔥 Request headers:`, headers)

    // Make request to backend
    console.log(`🔥 About to fetch ${url}`)
    const response = await fetch(url, {
      method,
      headers,
      body,
    })
    console.log(`🔥 Backend response status:`, response.status)

    // Get response data
    const contentType = response.headers.get('content-type')
    let responseData

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json()
    } else {
      // If not JSON, try to parse as text
      const responseText = await response.text()
      try {
        responseData = JSON.parse(responseText)
      } catch {
        responseData = { message: responseText || 'Unknown error' }
      }
    }

    // Return response
    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { message: 'Proxy error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}