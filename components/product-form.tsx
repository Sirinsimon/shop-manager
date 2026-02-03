'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import type { Product } from '@/app/page'

interface ProductFormProps {
  product?: Product
  onSave: (product: Product) => void
  onCancel: () => void
}

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    id: product?.id || '',
    name: product?.name || '',
    sku: product?.sku || '',
    cost: product?.cost || 0,
    sellingPrice: product?.sellingPrice || 0,
    quantity: product?.quantity || 0,
    minStock: product?.minStock || 5,
    category: product?.category || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.sku || formData.cost < 0 || formData.sellingPrice < 0) {
      alert('Please fill all required fields correctly')
      return
    }
    onSave(formData as Product)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' || name === 'sku' || name === 'category' ? value : parseFloat(value) || 0
    }))
  }

  const profit = formData.sellingPrice - formData.cost
  const margin = formData.sellingPrice > 0 ? ((profit / formData.sellingPrice) * 100).toFixed(1) : '0'

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{product ? 'Edit Product' : 'Add New Product'}</span>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Product Name *</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Wireless Headphones"
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">SKU *</label>
              <Input
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g., WH-001"
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <Input
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Electronics"
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Current Stock</label>
              <Input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                className="bg-secondary border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Cost Price ($) *</label>
              <Input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className="bg-secondary border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Selling Price ($) *</label>
              <Input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className="bg-secondary border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Min Stock Level</label>
              <Input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                placeholder="5"
                className="bg-secondary border-border text-foreground"
              />
            </div>
          </div>

          {/* Profit Display */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-lg border border-border">
            <div>
              <p className="text-xs text-muted-foreground">Profit per Unit</p>
              <p className="text-lg font-bold text-accent">${profit.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Profit Margin</p>
              <p className="text-lg font-bold text-accent">{margin}%</p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" onClick={onCancel} variant="outline">
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {product ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
