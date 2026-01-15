"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface LiquidBatteryProps {
    soc: number
    status: "NORMAL" | "WARNING" | "CRITICAL"
    className?: string
}

export function LiquidBattery({ soc, status, className }: LiquidBatteryProps) {
    const getColor = () => {
        if (status === 'CRITICAL') return 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]'
        if (soc < 20) return 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
        return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
    }

    return (
        <div className={cn("relative flex items-center gap-1", className)}>
            {/* Battery Body */}
            <div className="relative w-24 h-10 rounded-md border-2 border-slate-700 bg-slate-900/50 backdrop-blur-sm overflow-hidden p-0.5">
                {/* Fluid Fill (Horizontal) */}
                <motion.div
                    className={cn("h-full rounded-md transition-colors duration-500 relative", getColor())}
                    initial={{ width: "0%" }}
                    animate={{ width: `${soc}%` }}
                    transition={{
                        width: { type: "spring", stiffness: 50, damping: 15 },
                        duration: 1
                    }}
                >
                    {/* Bubbles / Liquid Effect Overlay */}
                    <div className="absolute inset-0 w-full h-full opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                    {/* Leading Edge Line/Waviness (Optional, simplified for horiz) */}
                    <div className="absolute right-0 top-0 bottom-0 w-px bg-white/40 blur-[0.5px]" />
                </motion.div>

                {/* Grid Lines Overlay */}
                <div className="absolute inset-0 w-full h-full flex justify-between px-2 pointer-events-none py-1 opacity-20">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-full w-px border-l border-dashed border-white" />
                    ))}
                </div>

                {/* Percentage Text Overlay Centered */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold text-white drop-shadow-md z-10 font-mono tracking-wider">
                        {Math.round(soc)}%
                    </span>
                </div>
            </div>

            {/* Battery Cap (Right side) */}
            <div className="w-1.5 h-6 rounded-r-sm bg-slate-700" />
        </div>
    )
}
