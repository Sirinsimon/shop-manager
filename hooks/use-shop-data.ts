'use client';

import { useState, useEffect, useCallback } from 'react'

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

export function useShopData() {
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    }
  }, [])

  // Fetch sales
  const fetchSales = useCallback(async () => {
    try {
      const response = await fetch('/api/sales')
      if (!response.ok) throw new Error('Failed to fetch sales')
      const data = await response.json()
      setSales(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales')
    }
  }, [])

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchProducts(), fetchSales()])
      setLoading(false)
    }
    loadData()
  }, [fetchProducts, fetchSales])

  // Add product
  const addProduct = useCallback(
    async (product: Omit<Product, 'id'>) => {
      try {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        })
        if (!response.ok) throw new Error('Failed to add product')
        const data = await response.json()
        setProducts([...products, data.data])
        return data.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add product'
        setError(message)
        throw err
      }
    },
    [products]
  )

  // Update product
  const updateProduct = useCallback(
    async (id: string, updates: Partial<Product>) => {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })
        if (!response.ok) throw new Error('Failed to update product')
        const data = await response.json()
        setProducts(products.map(p => (p.id === id ? data.data : p)))
        return data.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update product'
        setError(message)
        throw err
      }
    },
    [products]
  )

  // Delete product
  const deleteProduct = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete product')
        setProducts(products.filter(p => p.id !== id))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete product'
        setError(message)
        throw err
      }
    },
    [products]
  )

  // Add sale
  const addSale = useCallback(
    async (sale: Omit<Sale, 'id'>) => {
      try {
        const response = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sale),
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to add sale')
        }
        const data = await response.json()
        setSales([...sales, data.data])
        
        // Refresh products to get updated quantity
        await fetchProducts()
        
        return data.data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add sale'
        setError(message)
        throw err
      }
    },
    [sales, fetchProducts]
  )

  // Delete sale
  const deleteSale = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/sales/${id}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete sale')
        setSales(sales.filter(s => s.id !== id))
        
        // Refresh products to restore quantity
        await fetchProducts()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete sale'
        setError(message)
        throw err
      }
    },
    [sales, fetchProducts]
  )

  return {
    products,
    sales,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    addSale,
    deleteSale,
    refetch: async () => {
      await Promise.all([fetchProducts(), fetchSales()])
    },
  }
}
