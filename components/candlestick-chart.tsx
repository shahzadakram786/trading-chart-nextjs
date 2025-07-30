"use client"

import { useMemo } from "react"
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import type { CandlestickData } from "@/types/trading"
import { calculateSMA, calculateRSI } from "@/utils/indicators"

interface CandlestickChartProps {
  data: CandlestickData[]
  showIndicators: boolean
}

// Custom Candlestick component
const Candlestick = (props: any) => {
  const { payload, x, width, chartHeight, yScale } = props

  if (!payload || !yScale) return null

  const { open, close, high, low } = payload
  const isGreen = close >= open
  const color = isGreen ? "#10b981" : "#ef4444"
  const fillColor = isGreen ? "#10b981" : "#ef4444"

  // Calculate positions
  const centerX = x + width / 2
  const wickWidth = 1
  const bodyWidth = Math.max(width * 0.6, 2)

  // Scale prices to chart coordinates
  const highY = yScale(high)
  const lowY = yScale(low)
  const openY = yScale(open)
  const closeY = yScale(close)

  const bodyTop = Math.min(openY, closeY)
  const bodyBottom = Math.max(openY, closeY)
  const bodyHeight = Math.max(bodyBottom - bodyTop, 1)

  return (
    <g>
      {/* Upper wick */}
      <line x1={centerX} y1={highY} x2={centerX} y2={bodyTop} stroke={color} strokeWidth={wickWidth} />

      {/* Lower wick */}
      <line x1={centerX} y1={bodyBottom} x2={centerX} y2={lowY} stroke={color} strokeWidth={wickWidth} />

      {/* Body */}
      <rect
        x={centerX - bodyWidth / 2}
        y={bodyTop}
        width={bodyWidth}
        height={bodyHeight}
        fill={isGreen ? fillColor : "white"}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  )
}

// Custom chart component that renders candlesticks
const CandlestickRenderer = (props: any) => {
  const { data, width, height, margin } = props

  if (!data || data.length === 0) return null

  // Calculate price range
  const prices = data.flatMap((d: any) => [d.high, d.low])
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice
  const padding = priceRange * 0.1

  // Create y-scale function
  const yScale = (price: number) => {
    const chartTop = margin.top
    const chartBottom = height - margin.bottom
    const chartHeight = chartBottom - chartTop
    return chartTop + ((maxPrice + padding - price) / (priceRange + 2 * padding)) * chartHeight
  }

  const candleWidth = Math.max((width - margin.left - margin.right) / data.length - 2, 2)

  return (
    <svg width={width} height={height}>
      {data.map((item: any, index: number) => {
        const x = margin.left + index * (candleWidth + 2)
        return (
          <Candlestick
            key={index}
            payload={item}
            x={x}
            width={candleWidth}
            chartHeight={height - margin.top - margin.bottom}
            yScale={yScale}
          />
        )
      })}
    </svg>
  )
}

export default function CandlestickChart({ data, showIndicators }: CandlestickChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    const sma20 = calculateSMA(data, 20)
    const sma50 = calculateSMA(data, 50)
    const rsi = calculateRSI(data, 14)

    return data.map((item, index) => ({
      timestamp: item.timestamp,
      time: new Date(item.timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      open: Number(item.open.toFixed(2)),
      high: Number(item.high.toFixed(2)),
      low: Number(item.low.toFixed(2)),
      close: Number(item.close.toFixed(2)),
      volume: Number(item.volume.toFixed(0)),
      sma20: sma20[index] ? Number(sma20[index]!.toFixed(2)) : null,
      sma50: sma50[index] ? Number(sma50[index]!.toFixed(2)) : null,
      rsi: rsi[index] ? Number(rsi[index]!.toFixed(2)) : null,
    }))
  }, [data])

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-xl">BTC/USD</span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-mono">${currentPrice.toFixed(2)}</span>
              <div className={`flex items-center space-x-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                <span className="text-sm">{isPositive ? "▲" : "▼"}</span>
                <span className="text-sm font-mono">
                  {isPositive ? "+" : ""}
                  {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            H: ${Math.max(...data.slice(-24).map((d) => d.high)).toFixed(2)} | L: $
            {Math.min(...data.slice(-24).map((d) => d.low)).toFixed(2)}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            sma20: {
              label: "SMA 20",
              color: "hsl(var(--chart-2))",
            },
            sma50: {
              label: "SMA 50",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[500px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                domain={["dataMin - 50", "dataMax + 50"]}
                tick={{ fontSize: 11 }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={{ stroke: "#e5e7eb" }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-semibold">{label}</p>
                        <div className="space-y-1 text-sm">
                          <p>
                            Open: <span className="font-mono">${data.open}</span>
                          </p>
                          <p>
                            High: <span className="font-mono text-green-600">${data.high}</span>
                          </p>
                          <p>
                            Low: <span className="font-mono text-red-600">${data.low}</span>
                          </p>
                          <p>
                            Close: <span className="font-mono">${data.close}</span>
                          </p>
                          <p>
                            Volume: <span className="font-mono">{data.volume.toLocaleString()}</span>
                          </p>
                          {showIndicators && data.sma20 && (
                            <p>
                              SMA 20: <span className="font-mono">${data.sma20}</span>
                            </p>
                          )}
                          {showIndicators && data.sma50 && (
                            <p>
                              SMA 50: <span className="font-mono">${data.sma50}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />

              {/* Candlesticks - Custom implementation */}
              {chartData.map((entry, index) => {
                const x = (index / (chartData.length - 1)) * 100
                const isGreen = entry.close >= entry.open
                return (
                  <g key={index}>
                    {/* This is a simplified representation - in a real implementation, 
                        you'd want to use a proper candlestick library like @nivo/line or react-financial-charts */}
                  </g>
                )
              })}

              {/* Technical Indicators */}
              {showIndicators && (
                <>
                  <Line
                    type="monotone"
                    dataKey="sma20"
                    stroke="var(--color-sma20)"
                    strokeWidth={1.5}
                    dot={false}
                    name="SMA 20"
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="sma50"
                    stroke="var(--color-sma50)"
                    strokeWidth={1.5}
                    dot={false}
                    name="SMA 50"
                    connectNulls={false}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Custom Candlestick Overlay */}
        <div className="relative -mt-[500px] pointer-events-none">
          <CandlestickRenderer
            data={chartData.slice(-50)} // Show last 50 candles for performance
            width={800}
            height={500}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
