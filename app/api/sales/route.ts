import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/app/api/store'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const sales = store.getSales()
    return NextResponse.json({ success: true, data: sales })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.productId || body.quantity === undefined || body.salePrice === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = store.getProduct(body.productId)
    if (!product) {
      // Debug: log available products
      const allProducts = store.getProducts()
      console.log('Product not found. Looking for:', body.productId)
      console.log('Available products:', allProducts.map(p => ({ id: p.id, name: p.name })))
      
      return NextResponse.json(
        { success: false, error: `Product not found. ID: ${body.productId}` },
        { status: 404 }
      )
    }

    // Check if sufficient quantity
    if (product.quantity < body.quantity) {
      return NextResponse.json(
        { success: false, error: `Insufficient quantity. Available: ${product.quantity}, Requested: ${body.quantity}` },
        { status: 400 }
      )
    }

    const sale = store.addSale({
      productId: body.productId,
      quantity: Number(body.quantity),
      salePrice: Number(body.salePrice),
      date: body.date || new Date().toISOString().split('T')[0],
      notes: body.notes || '',
    })

    return NextResponse.json({ success: true, data: sale }, { status: 201 })
  } catch (error) {
    console.error('Error creating sale:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create sale' },
      { status: 500 }
    )
  }
}
