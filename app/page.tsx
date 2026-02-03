'use client'

import { useState, useEffect } from 'react'
import { Download, Plus, TrendingUp, Package, Zap, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Dashboard from '@/components/dashboard'
import ProductForm from '@/components/product-form'
import SalesForm from '@/components/sales-form'
import ProductList from '@/components/product-list'
import SalesList from '@/components/sales-list'
import AnalyticsDashboard from '@/components/analytics-dashboard'
import { useShopData, type Product, type Sale } from '@/hooks/use-shop-data'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function Home() {
  const { products, sales, loading, addProduct, updateProduct, deleteProduct, addSale, deleteSale } = useShopData()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showProductForm, setShowProductForm] = useState(false)
  const [showSalesForm, setShowSalesForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAddProduct = async (product: Omit<Product, 'id'>) => {
    try {
      setError(null)
      await addProduct(product)
      setShowProductForm(false)
    } catch (err) {
      setError('Failed to add product')
    }
  }

  const handleUpdateProduct = async (updated: Product) => {
    try {
      setError(null)
      await updateProduct(updated.id, updated)
      setEditingProduct(null)
      setShowProductForm(false)
    } catch (err) {
      setError('Failed to update product')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      setError(null)
      await deleteProduct(id)
    } catch (err) {
      setError('Failed to delete product')
    }
  }

  const handleAddSale = async (sale: Omit<Sale, 'id'>) => {
    try {
      setError(null)
      await addSale(sale)
      setShowSalesForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record sale')
    }
  }

  const handleDeleteSale = async (id: string) => {
    try {
      setError(null)
      await deleteSale(id)
    } catch (err) {
      setError('Failed to delete sale')
    }
  }

  const generatePDF = () => {
    try {
      const doc = new jsPDF()
      const pageHeight = doc.internal.pageSize.getHeight()
      let yPosition = 20

      // Title
      doc.setFontSize(24)
      doc.text('Shop Management Report', 15, yPosition)
      yPosition += 15

      // Date
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, yPosition)
      yPosition += 10
      doc.setTextColor(0)

      // Calculate totals
      const totalRevenue = sales.reduce((sum, s) => sum + (s.salePrice * s.quantity), 0)
      const totalCost = products.reduce((sum, p) => sum + (p.cost * p.quantity), 0)
      const totalProfit = sales.reduce((sum, s) => {
        const product = products.find(p => p.id === s.productId)
        return sum + ((s.salePrice - (product?.cost || 0)) * s.quantity)
      }, 0)

      // Financial Summary
      doc.setFontSize(12)
      doc.setFont(undefined, 'bold')
      doc.text('Financial Summary', 15, yPosition)
      yPosition += 8

      doc.setFont(undefined, 'normal')
      doc.setFontSize(11)
      doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 20, yPosition)
      yPosition += 6
      doc.text(`Total Cost: $${totalCost.toFixed(2)}`, 20, yPosition)
      yPosition += 6
      doc.text(`Total Profit: $${totalProfit.toFixed(2)}`, 20, yPosition)
      yPosition += 10

      // Product Inventory
      doc.setFont(undefined, 'bold')
      doc.text('Product Inventory', 15, yPosition)
      yPosition += 8

      const productData = products.map(p => [
        p.name,
        p.sku,
        p.quantity.toString(),
        `$${p.cost.toFixed(2)}`,
        `$${p.sellingPrice.toFixed(2)}`,
        `$${(p.sellingPrice - p.cost).toFixed(2)}`
      ])

      autoTable(doc, {
        head: [['Product', 'SKU', 'Qty', 'Cost', 'Price', 'Margin']],
        body: productData,
        startY: yPosition,
        headStyles: { fillColor: [102, 51, 200] as [number, number, number], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] as [number, number, number] },
        theme: 'striped'
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15

      // Add new page if needed
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        yPosition = 20
      }

      // Recent Sales
      doc.setFont(undefined, 'bold')
      doc.text('Recent Sales', 15, yPosition)
      yPosition += 8

      const salesData = sales.slice(-10).map(s => {
        const product = products.find(p => p.id === s.productId)
        return [
          product?.name || 'Unknown',
          s.quantity.toString(),
          `$${s.salePrice.toFixed(2)}`,
          `$${(s.salePrice * s.quantity).toFixed(2)}`,
          new Date(s.date).toLocaleDateString()
        ]
      })

      autoTable(doc, {
        head: [['Product', 'Qty', 'Price', 'Total', 'Date']],
        body: salesData,
        startY: yPosition,
        headStyles: { fillColor: [102, 51, 200] as [number, number, number], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] as [number, number, number] },
        theme: 'striped'
      })

      // Save the PDF
      doc.save('shop-report.pdf')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF report. Please check the console for details.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-foreground">Loading shop data...</p>
        </div>
      </div>
    )
  }

  const lowStockProducts = products.filter(p => p.quantity < p.minStock)
  const totalRevenue = sales.reduce((sum, s) => sum + (s.salePrice * s.quantity), 0)
  const totalProfit = sales.reduce((sum, s) => {
    const product = products.find(p => p.id === s.productId)
    return sum + ((s.salePrice - (product?.cost || 0)) * s.quantity)
  }, 0)
  const totalUnits = sales.reduce((sum, s) => sum + s.quantity, 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Shop Manager</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage inventory, track sales, and monitor profits</p>
          </div>
          <Button
            onClick={generatePDF}
            variant="outline"
            className="gap-2 bg-transparent"
          >
            <Download className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Sales</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <Dashboard
              products={products}
              sales={sales}
              onAddProduct={() => {
                setEditingProduct(null)
                setShowProductForm(true)
                setActiveTab('products')
              }}
              onAddSale={() => {
                setShowSalesForm(true)
                setActiveTab('sales')
              }}
              lowStockProducts={lowStockProducts}
            />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Product Inventory</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your product catalog and stock levels
                </p>
              </div>
              <Button
                onClick={() => {
                  setEditingProduct(null)
                  setShowProductForm(true)
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>

            {showProductForm && (
              <ProductForm
                product={editingProduct || undefined}
                onSave={(product) => {
                  if (editingProduct) {
                    handleUpdateProduct(product as Product)
                  } else {
                    handleAddProduct(product as Omit<Product, 'id'>)
                  }
                }}
                onCancel={() => {
                  setShowProductForm(false)
                  setEditingProduct(null)
                }}
              />
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg">
                {error}
              </div>
            )}

            <ProductList
              products={products}
              onEdit={(product) => {
                setEditingProduct(product)
                setShowProductForm(true)
              }}
              onDelete={handleDeleteProduct}
            />
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Sales Management</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Record and track your sales transactions
                </p>
              </div>
              <Button
                onClick={() => setShowSalesForm(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Record Sale
              </Button>
            </div>

            {showSalesForm && (
              <SalesForm
                products={products}
                onSave={handleAddSale}
                onCancel={() => setShowSalesForm(false)}
              />
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg">
                {error}
              </div>
            )}

            <SalesList
              sales={sales}
              products={products}
              onDelete={handleDeleteSale}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard
              products={products}
              sales={sales}
              totalRevenue={totalRevenue}
              totalProfit={totalProfit}
              totalUnits={totalUnits}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
