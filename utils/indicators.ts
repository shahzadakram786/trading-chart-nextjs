import type { CandlestickData } from "@/types/trading"

export function calculateSMA(data: CandlestickData[], period: number): (number | null)[] {
  if (!data || data.length === 0) return []

  const result: (number | null)[] = []

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null)
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, item) => acc + item.close, 0)
      result.push(sum / period)
    }
  }

  return result
}

export function calculateRSI(data: CandlestickData[], period = 14): (number | null)[] {
  if (!data || data.length === 0) return []

  const result: (number | null)[] = []

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(null)
      continue
    }

    let gains = 0
    let losses = 0

    for (let j = i - period + 1; j <= i; j++) {
      if (j === 0) continue
      const change = data[j].close - data[j - 1].close
      if (change > 0) gains += change
      else losses += Math.abs(change)
    }

    const avgGain = gains / period
    const avgLoss = losses / period

    if (avgLoss === 0) {
      result.push(100)
      continue
    }

    const rs = avgGain / avgLoss
    const rsi = 100 - 100 / (1 + rs)

    result.push(rsi)
  }

  return result
}
