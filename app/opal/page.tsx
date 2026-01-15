"use client"

import { useEffect, useRef } from "react"
import { useBMS } from "@/hooks/useBMS"
import { BatteryCard } from "@/components/ui/battery-card"
import { VoltageChart } from "@/components/ui/voltage-chart"
import { Activity, Power, AlertTriangle, PlayCircle, FlaskConical } from "lucide-react"

export default function OpalPage() {
    const { state, history, logs, isReady, initWorker, updateControl, runTests } = useBMS()
    const consoleRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        initWorker()
    }, [initWorker])

    // Auto-scroll console to bottom
    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight
        }
    }, [logs])

    const getLogColor = (level: string) => {
        switch (level) {
            case 'error': return 'text-red-400'
            case 'warn': return 'text-amber-400'
            case 'success': return 'text-emerald-400'
            default: return 'text-slate-400'
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-purple-500/30">
            {/* Header */}
            <header className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        OPAL-RT <span className="text-white">VIRTUAL HIL</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-mono text-sm">
                        BATTERY MANAGEMENT SYSTEM SIMULATOR // v1.0.0
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isReady ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-slate-900 border-slate-800'}`}>
                        <div className={`h-2 w-2 rounded-full ${isReady ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500 animate-pulse'}`} />
                        <span className="text-xs font-mono text-slate-300">
                            {isReady ? 'PYODIDE READY' : 'LOADING...'}
                        </span>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg border ${state.contactorsClosed ? 'border-slate-800' : 'border-red-500/50'}`}>
                        <div className={`h-2 w-2 rounded-full ${state.contactorsClosed ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500 animate-pulse'}`} />
                        <span className="text-xs font-mono text-slate-300">
                            {state.contactorsClosed ? 'HV ACTIVE' : 'HV DISCONNECTED'}
                        </span>
                    </div>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Pack Overview & Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <BatteryCard
                            className="h-full border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40 transition-colors"
                            voltage={state.packVoltage}
                            current={state.packCurrent}
                            temp={state.packTemp}
                            soc={state.soc}
                            status={state.faults.length > 0 ? "CRITICAL" : "NORMAL"}
                        />

                        {/* Control Panel */}
                        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6 backdrop-blur-xl flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center">
                                    <Activity className="w-4 h-4 mr-2" /> SIMULATION CONTROL
                                </h3>
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

                            <div className="mt-6 grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => updateControl({ injectFault: 'OVERTEMP' })}
                                    className="flex items-center justify-center px-3 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all text-xs font-bold"
                                >
                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                    FAULT
                                </button>
                                <button
                                    onClick={() => updateControl({ injectFault: 'NONE' })}
                                    className="flex items-center justify-center px-3 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-all text-xs font-bold"
                                >
                                    <PlayCircle className="w-4 h-4 mr-1" />
                                    RESET
                                </button>
                                <button
                                    onClick={runTests}
                                    disabled={!isReady}
                                    className="flex items-center justify-center px-3 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 hover:bg-indigo-500/20 transition-all text-xs font-bold disabled:opacity-50"
                                >
                                    <FlaskConical className="w-4 h-4 mr-1" />
                                    TEST
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Live Charts */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
                        <h3 className="text-sm font-medium text-slate-400 mb-4 font-mono">LIVE TELEMETRY</h3>
                        <VoltageChart data={history} />
                    </div>

                    {/* Cell Grid */}
                    <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-4 font-mono">INDIVIDUAL CELL MONITORING</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {state.cells.map((cell) => (
                                <div key={cell.id} className={`relative p-4 rounded-lg border ${cell.temp > 40 ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-800 bg-slate-900/50'}`}>
                                    <div className="absolute top-2 right-2 text-[10px] text-slate-600 font-mono">#{cell.id}</div>
                                    <div className="text-2xl font-mono text-white mb-1">{cell.voltage.toFixed(2)}<span className="text-xs text-slate-500 ml-1">V</span></div>
                                    <div className={`text-xs ${cell.temp > 40 ? 'text-amber-400' : 'text-slate-400'}`}>
                                        {cell.temp.toFixed(1)}°C
                                    </div>
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

                {/* Right Column: Console */}
                <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-black p-4 font-mono text-xs overflow-hidden flex flex-col h-full min-h-[500px]">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                        <span className="text-slate-400">~/simulation/console</span>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        </div>
                    </div>
                    <div ref={consoleRef} className="flex-1 overflow-y-auto space-y-1">
                        {logs.length === 0 && (
                            <div className="text-slate-600 animate-pulse">Waiting for Pyodide...</div>
                        )}
                        {logs.map((log, i) => (
                            <div key={i} className={getLogColor(log.level)}>
                                <span className="text-slate-600 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                {log.message}
                            </div>
                        ))}
                        <div className="text-slate-600 animate-pulse">_</div>
                    </div>
                </div>
            </main>
        </div>
    )
}
