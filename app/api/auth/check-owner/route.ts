import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

interface User {
  id: string
  username: string
  email: string
  password: string
  role: 'owner' | 'user'
  createdAt: string
}

interface UsersData {
  users: User[]
}

const getUsersFilePath = () => {
  return path.join(process.cwd(), 'users-data.json')
}

const loadUsers = (): UsersData => {
  try {
    const filePath = getUsersFilePath()
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading users:', error)
  }
  return { users: [] }
}

export async function GET() {
  try {
    const usersData = loadUsers()
    const ownerExists = usersData.users.length > 0

    return NextResponse.json({
      success: true,
      ownerExists,
      message: ownerExists ? 'Owner registered' : 'No owner registered',
    })
  } catch (error) {
    console.error('Check owner error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check owner status' },
      { status: 500 }
    )
  }
}
