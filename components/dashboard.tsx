'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react'
import type { Product, Sale } from '@/app/page'

interface DashboardProps {
  products: Product[]
  sales: Sale[]
  onAddProduct: () => void
  onAddSale: () => void
  lowStockProducts: Product[]
}

export default function Dashboard({
  products,
  sales,
  onAddProduct,
  onAddSale,
  lowStockProducts
}: DashboardProps) {
  const totalRevenue = sales.reduce((sum, s) => sum + (s.salePrice * s.quantity), 0)
  const totalCost = products.reduce((sum, p) => sum + (p.cost * p.quantity), 0)
  const totalProfit = sales.reduce((sum, s) => {
    const product = products.find(p => p.id === s.productId)
    return sum + ((s.salePrice - (product?.cost || 0)) * s.quantity)
  }, 0)
  const totalProducts = products.length
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0)
  const totalSales = sales.length

  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-2">Total from sales</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">${totalProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-2">{profitMargin}% margin</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalUnits}</div>
            <p className="text-xs text-muted-foreground mt-2">Units in stock</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-2">Total SKUs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="bg-card border-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Get started quickly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={onAddProduct} variant="outline" className="w-full justify-start bg-transparent">
              + Add New Product
            </Button>
            <Button onClick={onAddSale} variant="outline" className="w-full justify-start bg-transparent">
              + Record Sale
            </Button>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>
              {lowStockProducts.length} {lowStockProducts.length === 1 ? 'item' : 'items'} below minimum stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">All products are well stocked!</p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border"
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.quantity} in stock (min: {product.minStock})
                      </p>
                    </div>
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Products */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Top Selling Products
          </CardTitle>
          <CardDescription>Based on sales volume</CardDescription>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sales recorded yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(
                sales.reduce((acc, s) => {
                  const product = products.find(p => p.id === s.productId)
                  if (product) {
                    acc[s.productId] = (acc[s.productId] || 0) + s.quantity
                  }
                  return acc
                }, {} as Record<string, number>)
              )
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([productId, quantity]) => {
                  const product = products.find(p => p.id === productId)
                  return (
                    <div key={productId} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border">
                      <div>
                        <p className="font-medium text-foreground text-sm">{product?.name}</p>
                        <p className="text-xs text-muted-foreground">{quantity} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground text-sm">
                          ${(product?.sellingPrice || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
