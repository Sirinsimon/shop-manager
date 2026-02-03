'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Search, Calendar } from 'lucide-react'
import type { Product, Sale } from '@/app/page'

interface SalesListProps {
  sales: Sale[]
  products: Product[]
  onDelete: (id: string) => void
}

export default function SalesList({ sales, products, onDelete }: SalesListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const filteredSales = sales.filter(s => {
    const product = products.find(p => p.id === s.productId)
    const matchesSearch = product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.id.includes(searchTerm)
    const matchesDate = !dateFilter || s.date === dateFilter
    return matchesSearch && matchesDate
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.salePrice * s.quantity), 0)
  const totalProfit = filteredSales.reduce((sum, s) => {
    const product = products.find(p => p.id === s.productId)
    return sum + ((s.salePrice - (product?.cost || 0)) * s.quantity)
  }, 0)

  if (sales.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="pt-12 text-center">
          <p className="text-muted-foreground">No sales recorded yet. Record your first sale!</p>
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
            placeholder="Search by product or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="pl-9 bg-secondary border-border text-foreground w-full sm:w-auto"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1">Total Revenue (Filtered)</p>
            <p className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1">Total Profit (Filtered)</p>
            <p className="text-2xl font-bold text-accent">${totalProfit.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-foreground">Product</th>
              <th className="text-right py-3 px-4 font-medium text-foreground">Qty</th>
              <th className="text-right py-3 px-4 font-medium text-foreground">Price</th>
              <th className="text-right py-3 px-4 font-medium text-foreground">Total</th>
              <th className="text-right py-3 px-4 font-medium text-foreground">Profit</th>
              <th className="text-left py-3 px-4 font-medium text-foreground">Date</th>
              <th className="text-center py-3 px-4 font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale) => {
              const product = products.find(p => p.id === sale.productId)
              const total = sale.salePrice * sale.quantity
              const profit = (sale.salePrice - (product?.cost || 0)) * sale.quantity

              return (
                <tr
                  key={sale.id}
                  className="border-b border-border hover:bg-secondary/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-foreground">
                        {product?.name || 'Unknown Product'}
                      </p>
                      {sale.notes && (
                        <p className="text-xs text-muted-foreground italic mt-1">{sale.notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-foreground">{sale.quantity}</td>
                  <td className="py-3 px-4 text-right text-foreground">${sale.salePrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-foreground font-medium">${total.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-accent font-medium">${profit.toFixed(2)}</span>
                  </td>
                  <td className="py-3 px-4 text-foreground">
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm('Delete this sale record?')) {
                          onDelete(sale.id)
                        }
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filteredSales.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No sales match your search</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
