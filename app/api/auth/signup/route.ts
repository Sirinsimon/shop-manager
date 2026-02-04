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

const saveUsers = (data: UsersData): void => {
  try {
    const filePath = getUsersFilePath()
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error saving users:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password } = body

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Username must be at least 3 characters' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Load existing users
    const usersData = loadUsers()

    // Check if any users exist - only allow signup if no users exist (owner registration)
    if (usersData.users.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Registration is closed. Only the shop owner can register.' },
        { status: 403 }
      )
    }

    // Check if username already exists (shouldn't happen for first user, but keep for safety)
    const existingUser = usersData.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    )
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username already exists' },
        { status: 409 }
      )
    }

    // Check if email already exists
    const existingEmail = usersData.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    )
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Create new user - first user is always the owner
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      email,
      password, // In production, hash this with bcrypt!
      role: 'owner', // First user is the owner
      createdAt: new Date().toISOString(),
    }

    usersData.users.push(newUser)
    saveUsers(usersData)

    return NextResponse.json(
      {
        success: true,
        message: 'Owner account created successfully',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { success: false, error: 'Signup failed' },
      { status: 500 }
    )
  }
}

