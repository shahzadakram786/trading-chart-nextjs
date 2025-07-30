"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { OrderBook } from "@/types/trading"

interface OrderBookProps {
  orderBook: OrderBook
}

export default function OrderBookComponent({ orderBook }: OrderBookProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Order Book</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-3 gap-2 p-4 text-xs font-semibold border-b">
          <div>Price</div>
          <div className="text-right">Quantity</div>
          <div className="text-right">Total</div>
        </div>

        {/* Asks (Sell Orders) */}
        <div className="max-h-48 overflow-y-auto">
          {orderBook.asks
            .slice()
            .reverse()
            .map((ask, index) => (
              <div
                key={`ask-${index}`}
                className="grid grid-cols-3 gap-2 p-2 text-xs hover:bg-red-50 border-l-2 border-red-500"
              >
                <div className="text-red-600 font-mono">${ask.price.toFixed(2)}</div>
                <div className="text-right font-mono">{ask.quantity.toFixed(4)}</div>
                <div className="text-right font-mono">${ask.total.toFixed(2)}</div>
              </div>
            ))}
        </div>

        {/* Spread */}
        <div className="p-2 bg-gray-100 text-center text-xs font-semibold">
          Spread: ${(orderBook.asks[0]?.price - orderBook.bids[0]?.price).toFixed(2)}
        </div>

        {/* Bids (Buy Orders) */}
        <div className="max-h-48 overflow-y-auto">
          {orderBook.bids.map((bid, index) => (
            <div
              key={`bid-${index}`}
              className="grid grid-cols-3 gap-2 p-2 text-xs hover:bg-green-50 border-l-2 border-green-500"
            >
              <div className="text-green-600 font-mono">${bid.price.toFixed(2)}</div>
              <div className="text-right font-mono">{bid.quantity.toFixed(4)}</div>
              <div className="text-right font-mono">${bid.total.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
