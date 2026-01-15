"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface DataPoint {
    time: number
    voltage: number
    temp: number
}

interface VoltageChartProps {
    data: DataPoint[]
}

export function VoltageChart({ data }: VoltageChartProps) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: -10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                        dataKey="time"
                        stroke="#64748b"
                        tick={{ fontSize: 10 }}
                        tickFormatter={(v) => `${v}s`}
                    />
                    <YAxis
                        yAxisId="voltage"
                        width={30}
                        stroke="#a855f7"
                        tick={{ fontSize: 10 }}
                        domain={[12, 18]}
                        tickFormatter={(v) => `${v}V`}
                    />
                    <YAxis
                        yAxisId="temp"
                        orientation="right"
                        width={30}
                        stroke="#f97316"
                        tick={{ fontSize: 10 }}
                        domain={[20, 80]}
                        tickFormatter={(v) => `${v}°`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            fontSize: '12px'
                        }}
                        labelFormatter={(v) => `Time: ${v}s`}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line
                        yAxisId="voltage"
                        type="monotone"
                        dataKey="voltage"
                        stroke="#a855f7"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        name="Pack Voltage"
                    />
                    <Line
                        yAxisId="temp"
                        type="monotone"
                        dataKey="temp"
                        stroke="#f97316"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        name="Pack Temp"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
