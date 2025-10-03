import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://backend:80'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json({ message: 'No authorization header' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/two-factor/status`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('2FA status proxy error:', error)
    return NextResponse.json(
      { message: 'Proxy error' },
      { status: 500 }
    )
  }
}