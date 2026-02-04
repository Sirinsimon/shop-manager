'use client'

import React from "react"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Product, Sale } from '@/app/page'

interface SalesFormProps {
  products: Product[]
  onSave: (sale: Omit<Sale, 'id'>) => void
  onCancel: () => void
}

export default function SalesForm({ products, onSave, onCancel }: SalesFormProps) {
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 0,
    salePrice: 0,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const selectedProduct = products.find(p => p.id === formData.productId)
  const totalValue = formData.quantity * formData.salePrice
  const profit = selectedProduct ? (formData.salePrice - selectedProduct.cost) * formData.quantity : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.productId || formData.quantity <= 0 || formData.salePrice <= 0) {
      alert('Please fill all required fields')
      return
    }

    if (selectedProduct && formData.quantity > selectedProduct.quantity) {
      alert(`Not enough stock. Available: ${selectedProduct.quantity}`)
      return
    }

    onSave({
      productId: formData.productId,
      quantity: formData.quantity,
      salePrice: formData.salePrice,
      date: formData.date,
      notes: formData.notes
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'productId') {
      const product = products.find(p => p.id === value)
      setFormData(prev => ({
        ...prev,
        productId: value,
        salePrice: product?.sellingPrice || 0
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'notes' ? value : name === 'date' ? value : parseFloat(value) || 0
      }))
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Record New Sale</span>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground text-sm">
            Close
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Product *</label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-secondary border border-border text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Stock: {product.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Quantity *</label>
              <Input
                type="number"
                name="quantity"
                value={formData.quantity || ''}
                onChange={handleChange}
                placeholder="0"
                max={selectedProduct?.quantity || 0}
                className="bg-secondary border-border text-foreground"
              />
              {selectedProduct && (
                <p className="text-xs text-muted-foreground">
                  Available: {selectedProduct.quantity} units
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Sale Price ($) *</label>
              <Input
                type="number"
                name="salePrice"
                value={formData.salePrice || ''}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className="bg-secondary border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Sale Date</label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="bg-secondary border-border text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Notes (optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes about this sale..."
              rows={3}
              className="w-full px-3 py-2 bg-secondary border border-border text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
          </div>

          {/* Sale Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-lg border border-border">
            <div>
              <p className="text-xs text-muted-foreground">Total Value</p>
              <p className="text-lg font-bold text-foreground">${totalValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cost</p>
              <p className="text-lg font-bold text-foreground">
                ${(formData.quantity * (selectedProduct?.cost || 0)).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Profit</p>
              <p className="text-lg font-bold text-accent">${profit.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" onClick={onCancel} variant="outline">
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Record Sale
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
