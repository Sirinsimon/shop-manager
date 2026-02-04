'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import type { Product, Sale } from '@/app/page'
import { useTheme } from 'next-themes'

interface AnalyticsDashboardProps {
  products: Product[]
  sales: Sale[]
  totalRevenue: number
  totalProfit: number
  totalUnits: number
}

export default function AnalyticsDashboard({
  products,
  sales,
  totalRevenue,
  totalProfit,
  totalUnits
}: AnalyticsDashboardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  // Theme-aware colors
  const axisColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const tooltipBg = isDark ? '#1a1a2e' : '#ffffff'
  const tooltipTextColor = isDark ? '#fff' : '#000'
  const tooltipBorder = isDark ? 'none' : '1px solid #e5e7eb'
  
  // Daily sales trend
  const salesByDate = sales.reduce((acc, s) => {
    const date = new Date(s.date).toLocaleDateString()
    const existing = acc.find(item => item.date === date)
    if (existing) {
      existing.revenue += s.salePrice * s.quantity
      existing.quantity += s.quantity
    } else {
      acc.push({
        date,
        revenue: s.salePrice * s.quantity,
        quantity: s.quantity
      })
    }
    return acc
  }, [] as Array<{ date: string; revenue: number; quantity: number }>).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Category breakdown
  const categoryRevenue = products.reduce((acc, p) => {
    const categoryItem = acc.find(item => item.category === (p.category || 'Uncategorized'))
    const productSales = sales.filter(s => s.productId === p.id)
    const revenue = productSales.reduce((sum, s) => sum + (s.salePrice * s.quantity), 0)

    if (categoryItem) {
      categoryItem.value += revenue
    } else {
      acc.push({
        category: p.category || 'Uncategorized',
        value: revenue
      })
    }
    return acc
  }, [] as Array<{ category: string; value: number }>)

  // Top products by profit
  const productProfits = products
    .map(p => {
      const productSales = sales.filter(s => s.productId === p.id)
      const totalProfit = productSales.reduce((sum, s) => sum + ((s.salePrice - p.cost) * s.quantity), 0)
      return { name: p.name, profit: totalProfit, quantity: productSales.reduce((sum, s) => sum + s.quantity, 0) }
    })
    .filter(p => p.profit > 0)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5)

  const colors = ['#6633c8', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0'
  const avgOrderValue = sales.length > 0 ? (totalRevenue / sales.length).toFixed(2) : '0'

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-2">From all sales</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">${totalProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-2">{profitMargin}% margin</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Units Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalUnits}</div>
            <p className="text-xs text-muted-foreground mt-2">Total quantity</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">${avgOrderValue}</div>
            <p className="text-xs text-muted-foreground mt-2">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Sales Trend</CardTitle>
            <CardDescription>Revenue and units over time</CardDescription>
          </CardHeader>
          <CardContent>
            {salesByDate.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="date" stroke={axisColor} style={{ fontSize: '12px' }} />
                  <YAxis stroke={axisColor} style={{ fontSize: '12px' }} />
                  <YAxis yAxisId="right" orientation="right" stroke={axisColor} style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: tooltipBorder, borderRadius: '8px', color: tooltipTextColor }} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6633c8"
                    dot={false}
                    name="Revenue ($)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="quantity"
                    stroke="#3b82f6"
                    dot={false}
                    name="Units"
                    yAxisId="right"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-muted-foreground">
                No sales data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Revenue by Category</CardTitle>
            <CardDescription>Sales distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryRevenue.length > 0 && categoryRevenue.some(c => c.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryRevenue.filter(c => c.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, value }) => `${category}: $${value.toFixed(0)}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryRevenue.filter(c => c.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} contentStyle={{ backgroundColor: tooltipBg, border: tooltipBorder, borderRadius: '8px', color: tooltipTextColor }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-muted-foreground">
                No category data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products by Profit */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Top Products by Profit</CardTitle>
          <CardDescription>Best performing products</CardDescription>
        </CardHeader>
        <CardContent>
          {productProfits.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productProfits}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" stroke={axisColor} style={{ fontSize: '12px' }} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke={axisColor} style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: tooltipBorder, borderRadius: '8px', color: tooltipTextColor }} formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="profit" fill="#6633c8" name="Profit ($)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground">
              No product data yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Performance Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Product Performance</CardTitle>
          <CardDescription>Detailed metrics for each product</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Product</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">Units Sold</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">Revenue</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">Profit</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">Margin</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .map(p => {
                    const productSales = sales.filter(s => s.productId === p.id)
                    const revenue = productSales.reduce((sum, s) => sum + (s.salePrice * s.quantity), 0)
                    const profit = productSales.reduce((sum, s) => sum + ((s.salePrice - p.cost) * s.quantity), 0)
                    const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0'
                    return { product: p, units: productSales.reduce((sum, s) => sum + s.quantity, 0), revenue, profit, margin }
                  })
                  .filter(item => item.units > 0)
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((item) => (
                    <tr key={item.product.id} className="border-b border-border hover:bg-secondary/50">
                      <td className="py-3 px-4 font-medium text-foreground">{item.product.name}</td>
                      <td className="py-3 px-4 text-right text-foreground">{item.units}</td>
                      <td className="py-3 px-4 text-right text-foreground">${item.revenue.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-accent font-medium">${item.profit.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-accent">{item.margin}%</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
