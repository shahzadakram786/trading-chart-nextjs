export interface CandlestickData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface OrderBookEntry {
  price: number
  quantity: number
  total: number
}

export interface OrderBook {
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
}

export interface Trade {
  id: string
  price: number
  quantity: number
  side: "buy" | "sell"
  timestamp: number
}

export interface TechnicalIndicators {
  sma20: number | null
  sma50: number | null
  rsi: number | null
  macd: {
    macd: number
    signal: number
    histogram: number
  } | null
}
