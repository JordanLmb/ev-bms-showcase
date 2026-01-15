"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
// Replaced lucide-react Laptop with generic icon or just omit
import { Zap, Activity, Thermometer, Gauge, Battery } from "lucide-react"

interface BatteryCardProps extends React.HTMLAttributes<HTMLDivElement> {
    voltage: number
    temp: number
    current: number
    soc: number
    status: "NORMAL" | "WARNING" | "CRITICAL"
}

export function BatteryCard({
    voltage,
    temp,
    current,
    soc,
    status,
    className,
    ...props
}: BatteryCardProps) {

    const getStatusColor = (s: string) => {
        switch (s) {
            case "NORMAL": return "text-emerald-400 bg-emerald-400/10 border-emerald-500/20";
            case "WARNING": return "text-amber-400 bg-amber-400/10 border-amber-500/20";
            case "CRITICAL": return "text-rose-400 bg-rose-400/10 border-rose-500/20";
            default: return "text-slate-400";
        }
    }

    return (
        <div className={cn(
            "relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50 p-6 backdrop-blur-xl",
            className
        )} {...props}>
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-sm font-medium text-slate-400">BMS STATUS</h3>
                    <div className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(status))}>
                        {status}
                    </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="relative h-12 w-12 flex items-center justify-center">
                        {/* Battery Circular Indicator */}
                        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                            <circle className="text-slate-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                            <circle
                                className={cn("transition-all duration-500", status === 'CRITICAL' ? "text-rose-500" : "text-emerald-500")}
                                strokeWidth="8"
                                strokeDasharray={251.2}
                                strokeDashoffset={251.2 - (251.2 * soc) / 100}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="40"
                                cx="50"
                                cy="50"
                            />
                        </svg>
                        <span className="text-xs font-bold text-white">{Math.round(soc)}%</span>
                    </div>
                    <div className="flex items-center text-[9px] font-mono text-slate-500 tracking-wider">
                        <Battery className="w-3 h-3 mr-1" /> BATTERY
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <div className="flex items-center text-xs text-slate-500">
                        <Gauge className="mr-1 h-3 w-3" /> VOLTAGE
                    </div>
                    <div className="text-xl font-mono text-white">{voltage.toFixed(2)}V</div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center text-xs text-slate-500">
                        <Zap className="mr-1 h-3 w-3" /> CURRENT
                    </div>
                    <div className="text-xl font-mono text-white">{current.toFixed(1)}A</div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center text-xs text-slate-500">
                        <Thermometer className="mr-1 h-3 w-3" /> TEMP
                    </div>
                    <div className={cn("text-xl font-mono", temp > 45 ? "text-rose-400" : "text-white")}>
                        {temp.toFixed(1)}°C
                    </div>
                </div>
            </div>

            {/* Background Decor */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />
        </div>
    )
}
