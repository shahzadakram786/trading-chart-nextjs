"use client"

import { useMemo, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CandlestickData } from "@/types/trading"
import { calculateSMA } from "@/utils/indicators"

interface ProfessionalTradingChartProps {
  data: CandlestickData[]
  showIndicators: boolean
}

export default function ProfessionalTradingChart({ data, showIndicators }: ProfessionalTradingChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    const sma20 = calculateSMA(data, 20)
    const sma50 = calculateSMA(data, 50)

    return data.map((item, index) => ({
      ...item,
      sma20: sma20[index],
      sma50: sma50[index],
    }))
  }, [data])

  useEffect(() => {
    if (!canvasRef.current || !chartData.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height
    const padding = { top: 20, right: 60, bottom: 40, left: 60 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Calculate price range
    const visibleData = chartData.slice(-50) // Show last 50 candles
    const prices = visibleData.flatMap((d) => [d.high, d.low])
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice
    const priceBuffer = priceRange * 0.1

    // Helper functions
    const xScale = (index: number) => padding.left + (index / (visibleData.length - 1)) * chartWidth
    const yScale = (price: number) =>
      padding.top + ((maxPrice + priceBuffer - price) / (priceRange + 2 * priceBuffer)) * chartHeight

    // Draw grid
    ctx.strokeStyle = "#f3f4f6"
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const y = padding.top + (i / 10) * chartHeight
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding.left + (i / 10) * chartWidth
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, height - padding.bottom)
      ctx.stroke()
    }

    // Draw price labels
    ctx.fillStyle = "#6b7280"
    ctx.font = "11px monospace"
    ctx.textAlign = "right"
    for (let i = 0; i <= 10; i++) {
      const price = maxPrice + priceBuffer - (i / 10) * (priceRange + 2 * priceBuffer)
      const y = padding.top + (i / 10) * chartHeight
      ctx.fillText(`$${price.toFixed(0)}`, padding.left - 10, y + 4)
    }

    // Draw time labels
    ctx.textAlign = "center"
    const timeStep = Math.max(1, Math.floor(visibleData.length / 8))
    for (let i = 0; i < visibleData.length; i += timeStep) {
      const x = xScale(i)
      const time = new Date(visibleData[i].timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
      ctx.fillText(time, x, height - padding.bottom + 20)
    }

    // Draw technical indicators first (behind candles)
    if (showIndicators) {
      // SMA 20
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 1.5
      ctx.beginPath()
      let firstPoint = true
      visibleData.forEach((item, index) => {
        if (item.sma20) {
          const x = xScale(index)
          const y = yScale(item.sma20)
          if (firstPoint) {
            ctx.moveTo(x, y)
            firstPoint = false
          } else {
            ctx.lineTo(x, y)
          }
        }
      })
      ctx.stroke()

      // SMA 50
      ctx.strokeStyle = "#f59e0b"
      ctx.lineWidth = 1.5
      ctx.beginPath()
      firstPoint = true
      visibleData.forEach((item, index) => {
        if (item.sma50) {
          const x = xScale(index)
          const y = yScale(item.sma50)
          if (firstPoint) {
            ctx.moveTo(x, y)
            firstPoint = false
          } else {
            ctx.lineTo(x, y)
          }
        }
      })
      ctx.stroke()
    }

    // Draw candlesticks
    const candleWidth = Math.max((chartWidth / visibleData.length) * 0.7, 2)

    visibleData.forEach((item, index) => {
      const x = xScale(index)
      const openY = yScale(item.open)
      const closeY = yScale(item.close)
      const highY = yScale(item.high)
      const lowY = yScale(item.low)

      const isGreen = item.close >= item.open
      const color = isGreen ? "#10b981" : "#ef4444"
      const fillColor = isGreen ? "#10b981" : "#ffffff"

      // Draw wick
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, highY)
      ctx.lineTo(x, lowY)
      ctx.stroke()

      // Draw body
      const bodyTop = Math.min(openY, closeY)
      const bodyHeight = Math.abs(closeY - openY)

      ctx.fillStyle = fillColor
      ctx.strokeStyle = color
      ctx.lineWidth = 1

      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, Math.max(bodyHeight, 1))
      ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, Math.max(bodyHeight, 1))
    })

    // Draw legend
    if (showIndicators) {
      ctx.fillStyle = "#374151"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "left"

      // SMA 20 legend
      ctx.fillStyle = "#3b82f6"
      ctx.fillRect(padding.left, 10, 15, 2)
      ctx.fillStyle = "#374151"
      ctx.fillText("SMA 20", padding.left + 20, 15)

      // SMA 50 legend
      ctx.fillStyle = "#f59e0b"
      ctx.fillRect(padding.left + 80, 10, 15, 2)
      ctx.fillStyle = "#374151"
      ctx.fillText("SMA 50", padding.left + 100, 15)
    }
  }, [chartData, showIndicators])

  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>BTC/USD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center">
            <p>Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentPrice = data[data.length - 1]?.close || 0
  const previousPrice = data[data.length - 2]?.close || currentPrice
  const priceChange = currentPrice - previousPrice
  const priceChangePercent = previousPrice ? (priceChange / previousPrice) * 100 : 0
  const isPositive = priceChange >= 0

  // Calculate 24h high/low
  const last24h = data.slice(-24)
  const high24h = Math.max(...last24h.map((d) => d.high))
  const low24h = Math.min(...last24h.map((d) => d.low))

  return (
    <Card className="w-full ">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-xl font-bold ">BTC/USD</span>
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-mono font-bold">${currentPrice.toFixed(2)}</span>
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded ${
                  isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                <span className="text-sm font-bold">{isPositive ? "▲" : "▼"}</span>
                <span className="text-sm font-mono font-semibold">
                  {isPositive ? "+" : ""}
                  {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div>
              <span className="text-green-600 font-semibold">24h High:</span>
              <span className="font-mono ml-1">${high24h.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-red-600 font-semibold">24h Low:</span>
              <span className="font-mono ml-1">${low24h.toFixed(2)}</span>
            </div>
            <div>
              <span className="font-semibold">Volume:</span>
              <span className="font-mono ml-1">{data[data.length - 1]?.volume.toFixed(0)}</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="relative">
          <canvas ref={canvasRef} className="w-full h-[500px] border rounded" style={{ display: "block" }} />
        </div>
      </CardContent>
    </Card>
  )
}
