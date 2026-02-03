'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Edit2, Trash2, Search, AlertTriangle } from 'lucide-react'
import type { Product } from '@/app/page'

interface ProductListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

export default function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || p.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)))
  const lowStockCount = products.filter(p => p.quantity < p.minStock).length

  if (products.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="pt-12 text-center">
          <p className="text-muted-foreground">No products yet. Add one to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        {categories.length > 0 && (
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-secondary border border-border text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-foreground text-sm">
              {lowStockCount} {lowStockCount === 1 ? 'product' : 'products'} below minimum stock
            </p>
            <p className="text-xs text-muted-foreground mt-1">Consider reordering soon</p>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-foreground">Product</th>
              <th className="text-left py-3 px-4 font-medium text-foreground">SKU</th>
              <th className="text-right py-3 px-4 font-medium text-foreground">Stock</th>
              <th className="text-right py-3 px-4 font-medium text-foreground">Cost</th>
              <th className="text-right py-3 px-4 font-medium text-foreground">Price</th>
              <th className="text-right py-3 px-4 font-medium text-foreground">Margin</th>
              <th className="text-center py-3 px-4 font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const profit = product.sellingPrice - product.cost
              const margin = product.sellingPrice > 0 ? ((profit / product.sellingPrice) * 100).toFixed(1) : '0'
              const isLowStock = product.quantity < product.minStock

              return (
                <tr
                  key={product.id}
                  className={`border-b border-border hover:bg-secondary/50 transition-colors ${isLowStock ? 'bg-destructive/5' : ''}`}
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      {product.category && (
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-foreground">{product.sku}</td>
                  <td className="py-3 px-4 text-right">
                    <div className={isLowStock ? 'text-destructive font-bold' : 'text-foreground'}>
                      {product.quantity}
                    </div>
                    {isLowStock && (
                      <p className="text-xs text-destructive">Min: {product.minStock}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-foreground">${product.cost.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-foreground">${product.sellingPrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-accent font-medium">{margin}%</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(product)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm(`Delete "${product.name}"?`)) {
                            onDelete(product.id)
                          }
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No products match your search</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
