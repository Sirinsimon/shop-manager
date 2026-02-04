import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/app/api/store'

export const runtime = 'nodejs'

// Initialize sample data only if no data exists
if (store.getProducts().length === 0) {
  store.initializeSampleData()
}

export async function GET() {
  try {
    const products = store.getProducts()
    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.sku || body.cost === undefined || body.sellingPrice === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const product = store.addProduct({
      name: body.name,
      sku: body.sku,
      cost: Number(body.cost),
      sellingPrice: Number(body.sellingPrice),
      quantity: Number(body.quantity) || 0,
      minStock: Number(body.minStock) || 0,
      category: body.category || 'Uncategorized',
      reorderDate: body.reorderDate,
    })

    return NextResponse.json({ success: true, data: product }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
