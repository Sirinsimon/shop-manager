import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Load registered users
    const usersData = loadUsers()

    // Check if no users exist - redirect to signup
    if (usersData.users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No owner registered. Please sign up first.', redirectToSignup: true },
        { status: 401 }
      )
    }

    // Check registered users
    const user = usersData.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    )

    if (user) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Login successful',
          user: { 
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}
