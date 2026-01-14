"use client"

import { useEffect } from "react"
import { useBMS } from "@/hooks/useBMS"
import { BatteryCard } from "@/components/ui/battery-card"
import { Activity, Fan, Power, AlertTriangle, PlayCircle } from "lucide-react"

export default function OpalPage() {
    const { state, initWorker, updateControl } = useBMS()

    useEffect(() => {
        initWorker()
    }, [initWorker])

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-purple-500/30">
            {/* Header */}
            <header className="mb-12 flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        OPAL-RT <span className="text-white">VIRTUAL HIL</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-mono text-sm">
                        BATTERY MANAGEMENT SYSTEM SIMULATOR // v1.0.0
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg border border-slate-800">
                        <div className={`h-2 w-2 rounded-full ${state.contactorsClosed ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500 animate-pulse'}`} />
                        <span className="text-xs font-mono text-slate-300">
                            {state.contactorsClosed ? 'HV SYSTEM ACTIVE' : 'HV DISCONNECTED'}
                        </span>
                    </div>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Cells & Pack Stats */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Pack Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <BatteryCard
                            className="h-full border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40 transition-colors"
                            voltage={state.packVoltage}
                            current={state.packCurrent}
                            temp={state.packTemp}
                            soc={state.soc}
                            status={state.faults.length > 0 ? "CRITICAL" : "NORMAL"}
                        />

                        {/* Control Panel (Mock functionality for now) */}
                        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6 backdrop-blur-xl flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center">
                                    <Activity className="w-4 h-4 mr-2" /> SIMULATION CONTROL
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-500">LOAD CURRENT (AMPS)</label>
                                        <input
                                            type="range" min="0" max="100" step="1"
                                            defaultValue="0"
                                            className="w-full accent-purple-500"
                                            onChange={(e) => updateControl({ loadAmps: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => updateControl({ injectFault: 'OVERTEMP' })}
                                    className="flex items-center justify-center px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all text-xs font-bold tracking-wider"
                                >
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    INJECT FAULT
                                </button>
                                <button
                                    onClick={() => updateControl({ injectFault: 'NONE' })}
                                    className="flex items-center justify-center px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-all text-xs font-bold tracking-wider"
                                >
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    RESET SYSTEM
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Cell Grid */}
                    <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-4 font-mono">INDIVIDUAL CELL MONITORING</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {state.cells.map((cell) => (
                                <div key={cell.id} className="relative p-4 rounded-lg border border-slate-800 bg-slate-900/50">
                                    <div className="absolute top-2 right-2 text-[10px] text-slate-600 font-mono">#{cell.id}</div>
                                    <div className="text-2xl font-mono text-white mb-1">{cell.voltage.toFixed(2)}<span className="text-xs text-slate-500 ml-1">V</span></div>
                                    <div className={`text-xs ${cell.temp > 40 ? 'text-amber-400' : 'text-slate-400'}`}>
                                        {cell.temp.toFixed(1)}°C
                                    </div>
                                    {/* Balancing Indicator */}
                                    {cell.isBalancing && (
                                        <div className="mt-2 text-[9px] text-indigo-400 animate-pulse flex items-center">
                                            <Power className="w-3 h-3 mr-1" /> BALANCING
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Console/Logs (Placeholder for Phase 4) */}
                <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-black p-4 font-mono text-xs overflow-hidden flex flex-col h-full min-h-[400px]">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                        <span className="text-slate-400">~/simulation/logs</span>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1 text-slate-300">
                        <div className="text-slate-500">Initializing Pyodide Runtime...</div>
                        <div className="text-emerald-400">System Ready.</div>
                        <div className="opacity-50 mt-4">
                            {state.faults.length > 0 && state.faults.map(f => (
                                <div key={f} className="text-red-500 font-bold">
                                    [CRITICAL] FAULT DETECTED: {f}
                                </div>
                            ))}
                        </div>
                        <div className="text-slate-600 animate-pulse mt-2">_</div>
                    </div>
                </div>
            </main>
        </div>
    )
}
