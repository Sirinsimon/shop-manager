// In-memory data store for products and sales
export interface Product {
  id: string
  name: string
  sku: string
  cost: number
  sellingPrice: number
  quantity: number
  minStock: number
  reorderDate?: string
  category: string
}

export interface Sale {
  id: string
  productId: string
  quantity: number
  salePrice: number
  date: string
  notes: string
}

class DataStore {
  private products: Map<string, Product> = new Map()
  private sales: Map<string, Sale> = new Map()
  private productCounter = 0
  private saleCounter = 0

  // Product methods
  addProduct(product: Omit<Product, 'id'>): Product {
    const id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newProduct: Product = { ...product, id }
    this.products.set(id, newProduct)
    return newProduct
  }

  getProducts(): Product[] {
    return Array.from(this.products.values())
  }

  getProduct(id: string): Product | null {
    return this.products.get(id) || null
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const product = this.products.get(id)
    if (!product) return null
    const updated = { ...product, ...updates, id }
    this.products.set(id, updated)
    return updated
  }

  deleteProduct(id: string): boolean {
    return this.products.delete(id)
  }

  // Sale methods
  addSale(sale: Omit<Sale, 'id'>): Sale {
    const id = `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newSale: Sale = { ...sale, id }
    this.sales.set(id, newSale)
    
    // Update product quantity
    const product = this.products.get(sale.productId)
    if (product) {
      product.quantity -= sale.quantity
      this.products.set(sale.productId, product)
    }
    
    return newSale
  }

  getSales(): Sale[] {
    return Array.from(this.sales.values())
  }

  getSale(id: string): Sale | null {
    return this.sales.get(id) || null
  }

  deleteSale(id: string): boolean {
    const sale = this.sales.get(id)
    if (!sale) return false
    
    // Restore product quantity
    const product = this.products.get(sale.productId)
    if (product) {
      product.quantity += sale.quantity
      this.products.set(sale.productId, product)
    }
    
    return this.sales.delete(id)
  }

  // Initialize with sample data
  initializeSampleData(): void {
    if (this.products.size > 0) return

    const sampleProducts = [
      {
        name: 'Wireless Headphones',
        sku: 'WH-001',
        cost: 25,
        sellingPrice: 59.99,
        quantity: 45,
        minStock: 10,
        category: 'Electronics',
      },
      {
        name: 'USB-C Cable',
        sku: 'USB-001',
        cost: 2,
        sellingPrice: 9.99,
        quantity: 150,
        minStock: 50,
        category: 'Accessories',
      },
      {
        name: 'Phone Case',
        sku: 'PC-001',
        cost: 5,
        sellingPrice: 14.99,
        quantity: 8,
        minStock: 20,
        category: 'Accessories',
      },
      {
        name: 'Portable Charger',
        sku: 'PC-002',
        cost: 15,
        sellingPrice: 34.99,
        quantity: 32,
        minStock: 5,
        category: 'Electronics',
      },
      {
        name: 'Screen Protector',
        sku: 'SP-001',
        cost: 1.5,
        sellingPrice: 4.99,
        quantity: 200,
        minStock: 100,
        category: 'Accessories',
      },
    ]

    sampleProducts.forEach(prod => this.addProduct(prod))

    // Add sample sales
    const sampleSales = [
      {
        productId: Array.from(this.products.keys())[0],
        quantity: 2,
        salePrice: 59.99,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Regular sale',
      },
      {
        productId: Array.from(this.products.keys())[1],
        quantity: 5,
        salePrice: 9.99,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Bulk order',
      },
      {
        productId: Array.from(this.products.keys())[3],
        quantity: 1,
        salePrice: 34.99,
        date: new Date().toISOString().split('T')[0],
        notes: 'Today sale',
      },
    ]

    sampleSales.forEach(sale => this.addSale(sale))
  }
}

export const store = new DataStore()
