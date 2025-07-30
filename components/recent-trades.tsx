"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Trade } from "@/types/trading"

interface RecentTradesProps {
  trades: Trade[]
}

export default function RecentTrades({ trades }: RecentTradesProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-3 gap-2 p-4 text-xs font-semibold border-b">
          <div>Price</div>
          <div className="text-right">Quantity</div>
          <div className="text-right">Time</div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {trades
            .slice(-20)
            .reverse()
            .map((trade) => (
              <div
                key={trade.id}
                className={`grid grid-cols-3 gap-2 p-2 text-xs hover:bg-gray-50 ${
                  trade.side === "buy" ? "border-l-2 border-green-500" : "border-l-2 border-red-500"
                }`}
              >
                <div className={`font-mono ${trade.side === "buy" ? "text-green-600" : "text-red-600"}`}>
                  ${trade.price.toFixed(2)}
                </div>
                <div className="text-right font-mono">{trade.quantity.toFixed(4)}</div>
                <div className="text-right text-gray-500">{new Date(trade.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
