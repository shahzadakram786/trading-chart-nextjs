"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TradingControlsProps {
  currentPrice: number
  onTrade: (side: "buy" | "sell", quantity: number, price: number) => void
}

export default function TradingControls({ currentPrice, onTrade }: TradingControlsProps) {
  const [buyQuantity, setBuyQuantity] = useState("0.01")
  const [sellQuantity, setSellQuantity] = useState("0.01")
  const [buyPrice, setBuyPrice] = useState(currentPrice.toString())
  const [sellPrice, setSellPrice] = useState(currentPrice.toString())

  const handleBuy = () => {
    onTrade("buy", Number.parseFloat(buyQuantity), Number.parseFloat(buyPrice))
  }

  const handleSell = () => {
    onTrade("sell", Number.parseFloat(sellQuantity), Number.parseFloat(sellPrice))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Trading Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="text-green-600">
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="text-red-600">
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buy-price">Price (USD)</Label>
              <Input
                id="buy-price"
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="Price"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buy-quantity">Quantity (BTC)</Label>
              <Input
                id="buy-quantity"
                type="number"
                value={buyQuantity}
                onChange={(e) => setBuyQuantity(e.target.value)}
                placeholder="Quantity"
                step="0.001"
              />
            </div>
            <div className="text-sm text-gray-600">
              Total: ${(Number.parseFloat(buyPrice) * Number.parseFloat(buyQuantity)).toFixed(2)}
            </div>
            <Button onClick={handleBuy} className="w-full bg-green-600 hover:bg-green-700">
              Buy BTC
            </Button>
          </TabsContent>

          <TabsContent value="sell" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sell-price">Price (USD)</Label>
              <Input
                id="sell-price"
                type="number"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                placeholder="Price"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sell-quantity">Quantity (BTC)</Label>
              <Input
                id="sell-quantity"
                type="number"
                value={sellQuantity}
                onChange={(e) => setSellQuantity(e.target.value)}
                placeholder="Quantity"
                step="0.001"
              />
            </div>
            <div className="text-sm text-gray-600">
              Total: ${(Number.parseFloat(sellPrice) * Number.parseFloat(sellQuantity)).toFixed(2)}
            </div>
            <Button onClick={handleSell} className="w-full bg-red-600 hover:bg-red-700">
              Sell BTC
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
