"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
// Replaced lucide-react Laptop with generic icon or just omit
import { Zap, Activity, Thermometer, Gauge, Battery } from "lucide-react"
import { LiquidBattery } from "@/components/ui/liquid-battery"

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
            "relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50 p-6 backdrop-blur-xl flex flex-col gap-8",
            className
        )} {...props}>

            {/* Header: Status (Left) & Battery (Right) */}
            <div className="flex items-center justify-between w-full z-10 relative">

                {/* Left: Status Text + Badge on same line */}
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-medium text-slate-400">BMS STATUS</h3>
                    <div className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-sm transition-all duration-300", getStatusColor(status))}>
                        {status === 'NORMAL' && <Activity className="w-3 h-3 mr-1.5" />}
                        {status === 'WARNING' && <Activity className="w-3 h-3 mr-1.5" />}
                        {status === 'CRITICAL' && <Activity className="w-3 h-3 mr-1.5" />}
                        {status}
                    </div>
                </div>

                {/* Right: Battery */}
                <LiquidBattery soc={soc} status={status} />
            </div>

            {/* Content: Big Metrics Centered (3 in a line) */}
            <div className="w-full grid grid-cols-3 gap-4 z-10 relative px-2 mb-2">
                <div className="space-y-2 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/30 border border-slate-800/50">
                    <div className="flex items-center justify-center text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                        <Gauge className="mr-1.5 h-3 w-3" /> Volt
                    </div>
                    <div className="text-2xl font-mono text-white tracking-tight">{voltage.toFixed(2)}<span className="text-slate-600 text-sm ml-0.5">V</span></div>
                </div>
                <div className="space-y-2 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/30 border border-slate-800/50">
                    <div className="flex items-center justify-center text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                        <Zap className="mr-1.5 h-3 w-3" /> Amps
                    </div>
                    <div className="text-2xl font-mono text-white tracking-tight">{current.toFixed(1)}<span className="text-slate-600 text-sm ml-0.5">A</span></div>
                </div>
                <div className="space-y-2 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/30 border border-slate-800/50">
                    <div className="flex items-center justify-center text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                        <Thermometer className="mr-1.5 h-3 w-3" /> Temp
                    </div>
                    <div className={cn("text-2xl font-mono tracking-tight transition-colors", temp > 45 ? "text-rose-400" : "text-white")}>
                        {temp.toFixed(1)}<span className="text-slate-600 text-sm ml-0.5">°C</span>
                    </div>
                </div>
            </div>

            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        </div>
    )
}
