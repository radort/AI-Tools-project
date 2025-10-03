import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = 'http://backend:80'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const body = await request.json()

    if (!authHeader) {
      return NextResponse.json({ message: 'No authorization header' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/two-factor/recovery-codes`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('2FA recovery codes proxy error:', error)
    return NextResponse.json(
      { message: 'Proxy error' },
      { status: 500 }
    )
  }
}