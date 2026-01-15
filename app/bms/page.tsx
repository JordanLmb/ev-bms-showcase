"use client"

import { useEffect, useRef, useState } from "react"
import { useBMS } from "@/hooks/useBMS"
import { BatteryCard } from "@/components/ui/battery-card"
import { VoltageChart } from "@/components/ui/voltage-chart"
import { Activity, Power, AlertTriangle, PlayCircle, FlaskConical, Zap, Thermometer, BatteryLow } from "lucide-react"

export default function OpalPage() {
    const { state, history, logs, isReady, initWorker, updateControl, runTests } = useBMS()
    const consoleRef = useRef<HTMLDivElement>(null)
    const [loadCurrent, setLoadCurrent] = useState(0)

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

    // Cell health color based on temp and voltage
    const getCellColor = (temp: number, voltage: number) => {
        if (temp > 60) return 'border-red-500 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
        if (temp > 45) return 'border-amber-500 bg-amber-500/10'
        if (voltage > 4.2) return 'border-red-500 bg-red-500/10'
        if (voltage < 3.0) return 'border-amber-500 bg-amber-500/10'
        return 'border-slate-800 bg-slate-900/50'
    }

    const handleLoadChange = (value: number) => {
        setLoadCurrent(value)
        updateControl({ loadAmps: value })
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-purple-500/30">
            {/* Header */}
            <header className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        VIRTUAL <span className="text-white">HIL SIMULATOR</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-mono text-sm">
                        BATTERY MANAGEMENT SYSTEM // v1.0.0
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isReady ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-slate-900 border-slate-800'}`}>
                        <div className={`h-2 w-2 rounded-full ${isReady ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500 animate-pulse'}`} />
                        <span className="text-xs font-mono text-slate-300">
                            {isReady ? 'PYODIDE READY' : 'LOADING...'}
                        </span>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg border ${state.contactorsClosed ? 'border-slate-800' : 'border-red-500/50 bg-red-500/10'}`}>
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
                        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 backdrop-blur-xl flex flex-col gap-3">
                            <div>
                                <h3 className="text-xs font-medium text-slate-400 mb-2 flex items-center justify-between">
                                    <span className="flex items-center"><Activity className="w-3 h-3 mr-1" /> CONTROLS</span>
                                    <span className="text-purple-400 font-mono text-xs">{loadCurrent}A LOAD</span>
                                </h3>
                                <input
                                    type="range" min="0" max="50" step="5"
                                    value={loadCurrent}
                                    className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                    onChange={(e) => handleLoadChange(parseFloat(e.target.value))}
                                />
                            </div>

                            {/* Fault Injection - Grid */}
                            <div>
                                <label className="text-[10px] text-slate-500 mb-1 block uppercase tracking-wider">Inject Faults</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => updateControl({ injectFault: 'OVERTEMP' })}
                                        className="flex items-center justify-center px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 hover:bg-orange-500/20 transition-all text-xs font-medium"
                                    >
                                        <Thermometer className="w-3 h-3 mr-1" />
                                        OVERHEAT
                                    </button>
                                    <button
                                        onClick={() => updateControl({ injectFault: 'OVERVOLTAGE' })}
                                        className="flex items-center justify-center px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 hover:bg-yellow-500/20 transition-all text-xs font-medium"
                                    >
                                        <Zap className="w-3 h-3 mr-1" />
                                        OVERCHARGE
                                    </button>
                                    <button
                                        onClick={() => updateControl({ injectFault: 'UNDERVOLTAGE' })}
                                        className="flex items-center justify-center px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all text-xs font-medium"
                                    >
                                        <BatteryLow className="w-3 h-3 mr-1" />
                                        DEEP DISCH
                                    </button>
                                    <button
                                        onClick={() => updateControl({ injectFault: 'SHORT_CIRCUIT' })}
                                        className="flex items-center justify-center px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all text-xs font-medium"
                                    >
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        SHORT
                                    </button>
                                </div>
                            </div>

                            {/* Actions & Sabotage */}
                            <div className="flex gap-2 mt-1">
                                <button
                                    onClick={() => updateControl({ injectFault: 'SABOTAGE' })}
                                    className="flex-1 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-all text-[10px] font-bold flex items-center justify-center tracking-wider"
                                    title="Disable safety features to demonstrate test failure"
                                >
                                    SABOTAGE
                                </button>
                                <button
                                    onClick={() => { updateControl({ injectFault: 'NONE' }); setLoadCurrent(0); }}
                                    className="w-9 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                    title="Reset System"
                                >
                                    <PlayCircle className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={runTests}
                                    disabled={!isReady}
                                    className="w-9 flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 hover:bg-indigo-500/20 transition-all disabled:opacity-50"
                                    title="Run Tests Manually"
                                >
                                    <FlaskConical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Live Charts */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
                        <h3 className="text-sm font-medium text-slate-400 mb-4 font-mono">LIVE TELEMETRY</h3>
                        <VoltageChart data={history} />
                    </div>

                    {/* Cell Grid - Now with dynamic colors! */}
                    <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-4 font-mono">INDIVIDUAL CELL MONITORING</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {state.cells.map((cell) => (
                                <div
                                    key={cell.id}
                                    className={`relative p-4 rounded-lg border transition-all duration-300 ${getCellColor(cell.temp, cell.voltage)}`}
                                >
                                    <div className="absolute top-2 right-2 text-[10px] text-slate-600 font-mono">CELL #{cell.id}</div>
                                    <div className="text-2xl font-mono text-white mb-1">
                                        {cell.voltage.toFixed(2)}
                                        <span className="text-xs text-slate-500 ml-1">V</span>
                                    </div>
                                    <div className={`text-sm font-mono ${cell.temp > 45 ? 'text-amber-400' : cell.temp > 60 ? 'text-red-400' : 'text-slate-400'}`}>
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
                <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-black p-4 font-mono text-xs overflow-hidden flex flex-col h-[500px] lg:h-[700px]">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800 flex-shrink-0">
                        <span className="text-slate-400">~/bms/test_output</span>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        </div>
                    </div>
                    <div ref={consoleRef} className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
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
