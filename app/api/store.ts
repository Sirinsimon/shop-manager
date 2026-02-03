import fs from 'fs'
import path from 'path'

// In-memory data store for products and sales with file persistence
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

interface StoreData {
  products: Record<string, Product>
  sales: Record<string, Sale>
}

class DataStore {
  private products: Map<string, Product> = new Map()
  private sales: Map<string, Sale> = new Map()
  private dataFile: string
  private initialized = false

  constructor() {
    // Store data in the project root
    this.dataFile = path.join(process.cwd(), 'shop-data.json')
    this.loadFromFile()
  }

  private loadFromFile(): void {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf-8')
        const parsed: StoreData = JSON.parse(data)
        
        // Clear existing data
        this.products.clear()
        this.sales.clear()
        
        // Load products
        Object.values(parsed.products || {}).forEach(product => {
          this.products.set(product.id, product)
        })
        
        // Load sales
        Object.values(parsed.sales || {}).forEach(sale => {
          this.sales.set(sale.id, sale)
        })
        
        this.initialized = true
        console.log(`✓ Loaded ${this.products.size} products and ${this.sales.size} sales from file`)
      } else {
        console.log('No data file found, will initialize with sample data on first request')
      }
    } catch (error) {
      console.error('Error loading data from file:', error)
    }
  }

  private saveToFile(): void {
    try {
      const data: StoreData = {
        products: Object.fromEntries(this.products),
        sales: Object.fromEntries(this.sales),
      }
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2), 'utf-8')
    } catch (error) {
      console.error('Error saving data to file:', error)
    }
  }

  // Product methods
  addProduct(product: Omit<Product, 'id'>): Product {
    const id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newProduct: Product = { ...product, id }
    this.products.set(id, newProduct)
    this.saveToFile()
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
    this.saveToFile()
    return updated
  }

  deleteProduct(id: string): boolean {
    const result = this.products.delete(id)
    if (result) this.saveToFile()
    return result
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
    
    this.saveToFile()
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
    
    const result = this.sales.delete(id)
    if (result) this.saveToFile()
    return result
  }

  // Initialize with sample data
  initializeSampleData(): void {
    // Only initialize if we haven't loaded from file and have no products
    if (this.initialized || this.products.size > 0) {
      console.log('Skipping sample data initialization - data already exists')
      return
    }

    console.log('Initializing with sample data...')

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
    this.initialized = true
    console.log('✓ Sample data initialized')
  }
}

// Use global to persist store across hot reloads in development
const globalForStore = global as unknown as { store: DataStore }

export const store = globalForStore.store || new DataStore()

if (process.env.NODE_ENV !== 'production') {
  globalForStore.store = store
}
