import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST() {
  return NextResponse.json(
    { success: true, message: 'Logout successful' },
    { status: 200 }
  )
}
