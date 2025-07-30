import type { CandlestickData, OrderBook, Trade } from "@/types/trading"

export class TradingDataGenerator {
  private currentPrice = 50000
  private lastTimestamp: number = Date.now()
  private candleInterval = 60000 // 1 minute candles
  private currentCandle: CandlestickData | null = null

  generateInitialData(count = 100): CandlestickData[] {
    const data: CandlestickData[] = []
    let price = this.currentPrice
    let timestamp = Date.now() - count * this.candleInterval

    for (let i = 0; i < count; i++) {
      const open = price
      const volatility = 0.02
      const change = (Math.random() - 0.5) * price * volatility
      const close = Math.max(open + change, 1000)

      const high = Math.max(open, close) + Math.random() * price * 0.05
      const low = Math.min(open, close) - Math.random() * price * 0.01
      const volume = Math.random() * 1000 + 100

      data.push({
        timestamp,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Number(volume.toFixed(2)),
      })

      price = close
      timestamp += this.candleInterval
    }

    this.currentPrice = price
    this.lastTimestamp = timestamp
    return data
  }

  generateNextCandle(): CandlestickData | null {
    const now = Date.now()

    if (!this.currentCandle || now - this.lastTimestamp >= this.candleInterval) {
      // Start new candle
      this.currentCandle = {
        timestamp: this.lastTimestamp,
        open: Number(this.currentPrice.toFixed(2)),
        high: Number(this.currentPrice.toFixed(2)),
        low: Number(this.currentPrice.toFixed(2)),
        close: Number(this.currentPrice.toFixed(2)),
        volume: 0,
      }
      this.lastTimestamp = now
    }

    // Update current candle
    const volatility = 0.001
    const change = (Math.random() - 0.5) * this.currentPrice * volatility
    this.currentPrice = Math.max(this.currentPrice + change, 1000)

    this.currentCandle.close = Number(this.currentPrice.toFixed(2))
    this.currentCandle.high = Number(Math.max(this.currentCandle.high, this.currentPrice).toFixed(2))
    this.currentCandle.low = Number(Math.min(this.currentCandle.low, this.currentPrice).toFixed(2))
    this.currentCandle.volume = Number((this.currentCandle.volume + Math.random() * 10 + 1).toFixed(2))

    return { ...this.currentCandle }
  }

  generateOrderBook(): OrderBook {
    const spread = this.currentPrice * 0.001
    const bids: any[] = []
    const asks: any[] = []

    for (let i = 0; i < 10; i++) {
      const bidPrice = Number((this.currentPrice - spread - i * spread * 0.1).toFixed(2))
      const askPrice = Number((this.currentPrice + spread + i * spread * 0.1).toFixed(2))
      const quantity = Number((Math.random() * 5 + 0.1).toFixed(4))

      bids.push({
        price: bidPrice,
        quantity: quantity,
        total: Number((bidPrice * quantity).toFixed(2)),
      })

      asks.push({
        price: askPrice,
        quantity: quantity,
        total: Number((askPrice * quantity).toFixed(2)),
      })
    }

    return { bids, asks }
  }

  generateTrade(): Trade {
    return {
      id: Math.random().toString(36).substr(2, 9),
      price: Number(this.currentPrice.toFixed(2)),
      quantity: Number((Math.random() * 2 + 0.1).toFixed(4)),
      side: Math.random() > 0.5 ? "buy" : "sell",
      timestamp: Date.now(),
    }
  }
}
