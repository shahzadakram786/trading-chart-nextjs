"use client"

import ProfessionalTradingChart from "./professional-trading-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import type { CandlestickData } from "@/types/trading"

interface TradingChartProps {
  data: CandlestickData[]
  showIndicators: boolean
}

export default function TradingChart({ data, showIndicators }: TradingChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="space-y-4">
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
      </div>
    )
  }

  const volumeData = data.slice(-50).map((item, index) => ({
    time: new Date(item.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    volume: Number(item.volume.toFixed(0)),
    isGreen: index === 0 ? true : item.close >= data[data.indexOf(item) - 1]?.close,
  }))

  return (
    <div className="space-y-4 w-full">
      {/* Professional Candlestick Chart */}
      <ProfessionalTradingChart data={data} showIndicators={showIndicators} />

      {/* Volume Chart */}
      {/* <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              volume: {
                label: "Volume",
                color: "hsl(var(--chart-4))",
              },
            }}
            className="h-[150px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={{ stroke: "#e5e7eb" }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border rounded shadow-lg">
                          <p className="font-semibold">{label}</p>
                          <p className="text-sm">
                            Volume: <span className="font-mono">{payload[0].value?.toLocaleString()}</span>
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="volume" name="Volume">
                  {volumeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isGreen ? "#10b981" : "#ef4444"} opacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card> */}
    </div>
  )
}
