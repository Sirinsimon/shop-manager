import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/app/api/store'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sale = store.getSale(id)
    
    if (!sale) {
      return NextResponse.json(
        { success: false, error: 'Sale not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: sale })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sale' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = store.deleteSale(id)

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Sale not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Sale deleted' })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete sale' },
      { status: 500 }
    )
  }
}
