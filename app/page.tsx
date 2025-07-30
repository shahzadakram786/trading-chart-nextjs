"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import TradingChart from "@/components/trading-chart"
import OrderBookComponent from "@/components/order-book"
import TradingControls from "@/components/trading-controls"
import RecentTrades from "@/components/recent-trades"
import { TradingDataGenerator } from "@/utils/data-generator"
import type { CandlestickData, OrderBook, Trade } from "@/types/trading"

export default function TradingDashboard() {
  const [data, setData] = useState<CandlestickData[]>([])
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] })
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLive, setIsLive] = useState(true)
  const [showIndicators, setShowIndicators] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [dataGenerator] = useState(() => new TradingDataGenerator())

  // Initialize data
  useEffect(() => {
    try {
      const initialData = dataGenerator.generateInitialData(100)
      setData(initialData)
      setOrderBook(dataGenerator.generateOrderBook())
      setIsLoading(false)
    } catch (error) {
      console.error("Error initializing data:", error)
      setIsLoading(false)
    }
  }, [dataGenerator])

  // Live data updates
  useEffect(() => {
    if (!isLive || isLoading) return

    const interval = setInterval(() => {
      try {
        // Update chart data
        const newCandle = dataGenerator.generateNextCandle()
        if (newCandle) {
          setData((prevData) => {
            if (!prevData || prevData.length === 0) return [newCandle]

            const newData = [...prevData]
            const lastCandle = newData[newData.length - 1]

            // Update last candle or add new one
            if (lastCandle && Math.floor(newCandle.timestamp / 60000) === Math.floor(lastCandle.timestamp / 60000)) {
              newData[newData.length - 1] = newCandle
            } else {
              newData.push(newCandle)
              // Keep only last 200 candles
              if (newData.length > 200) {
                newData.shift()
              }
            }
            return newData
          })
        }

        // Update order book
        setOrderBook(dataGenerator.generateOrderBook())

        // Add random trade
        if (Math.random() > 0.7) {
          const newTrade = dataGenerator.generateTrade()
          setTrades((prevTrades) => {
            const newTrades = [...prevTrades, newTrade]
            // Keep only last 50 trades
            if (newTrades.length > 50) {
              return newTrades.slice(-50)
            }
            return newTrades
          })
        }
      } catch (error) {
        console.error("Error updating data:", error)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isLive, isLoading, dataGenerator])

  const handleTrade = (side: "buy" | "sell", quantity: number, price: number) => {
    try {
      const newTrade: Trade = {
        id: Math.random().toString(36).substr(2, 9),
        price: Number(price.toFixed(2)),
        quantity: Number(quantity.toFixed(4)),
        side,
        timestamp: Date.now(),
      }
      setTrades((prevTrades) => [...prevTrades, newTrade])

      // Show success message (you could add a toast here)
      console.log(`${side.toUpperCase()} order placed: ${quantity} BTC at $${price}`)
    } catch (error) {
      console.error("Error placing trade:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Loading Trading Dashboard...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  const currentPrice = data.length > 0 ? data[data.length - 1].close : 0
  const priceChange = data.length > 1 ? data[data.length - 1].close - data[data.length - 2].close : 0
  const priceChangePercent = data.length > 1 ? (priceChange / data[data.length - 2].close) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold">Live Trading Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-mono">${currentPrice.toFixed(2)}</div>
              <div className={`text-lg ${priceChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {priceChange >= 0 ? "+" : ""}
                {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch id="live-mode" checked={isLive} onCheckedChange={setIsLive} />
              <Label htmlFor="live-mode">Live Data</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="indicators" checked={showIndicators} onCheckedChange={setShowIndicators} />
              <Label htmlFor="indicators">Technical Indicators</Label>
            </div>

            <div
              className={`px-2 py-1 rounded text-sm ${isLive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {isLive ? "LIVE" : "PAUSED"}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chart - Takes up 3 columns */}
          <div className="lg:col-span-3">
            <TradingChart data={data} showIndicators={showIndicators} />
          </div>

          {/* Right Sidebar */}
          {/* <div className="space-y-6">
            <TradingControls currentPrice={currentPrice} onTrade={handleTrade} />

            <OrderBookComponent orderBook={orderBook} />

            <RecentTrades trades={trades} />
          </div> */}
        </div>
      </div>
    </div>
  )
}
