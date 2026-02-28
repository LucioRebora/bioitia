"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Receipt, Search, Plus, Trash2, Save, ArrowLeft, FlaskConical, ShieldCheck, Loader2, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Plan {
    id: string;
    nombre: string;
    nbu: number;
}

interface Study {
    id: string;
    codigo: number;
    determinacion: string;
    ub: number;
}

interface SelectedStudy extends Study {
    planId: string;
    planNombre: string;
    nbu: number;
    valor: number;
}

export default function NewBudgetPage() {
    const router = useRouter();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [studies, setStudies] = useState<Study[]>([]);
    const [defaultPlanId, setDefaultPlanId] = useState("");
    const [paciente, setPaciente] = useState("");
    const [telefono, setTelefono] = useState("");
    const [email, setEmail] = useState("");
    const [selectedStudies, setSelectedStudies] = useState<SelectedStudy[]>([]);
    const [searchStudy, setSearchStudy] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState(false);

    // Load plans
    useEffect(() => {
        const labId = localStorage.getItem('selectedLaboratoryId') || '';
        fetch(`/api/plans?labId=${labId}`).then(res => res.json()).then(setPlans);
    }, []);

    // Load studies (debounced search)
    useEffect(() => {
        if (searchStudy.length < 2) {
            setStudies([]);
            return;
        }
        const t = setTimeout(() => {
            fetch(`/api/studies?q=${encodeURIComponent(searchStudy)}`)
                .then(res => res.json())
                .then(setStudies);
        }, 300);
        return () => clearTimeout(t);
    }, [searchStudy]);

    const activeDefaultPlan = plans.find(p => p.id === defaultPlanId);

    const changePlanForItem = useCallback((itemId: string, planId: string) => {
        const plan = plans.find(p => p.id === planId);
        if (!plan) return;

        setSelectedStudies(prev => prev.map(s => {
            if (s.id === itemId) {
                return {
                    ...s,
                    planId: plan.id,
                    planNombre: plan.nombre,
                    nbu: plan.nbu,
                    valor: s.ub * plan.nbu
                };
            }
            return s;
        }));
    }, [plans]);

    // Auto-add "Acto Bioquímico" (660001) when a default plan is selected
    useEffect(() => {
        if (!defaultPlanId || !activeDefaultPlan) return;

        const addActoBioquimico = async () => {
            const exists = selectedStudies.find(s => s.codigo === 660001);
            if (exists) {
                changePlanForItem(exists.id, defaultPlanId);
                return;
            }

            try {
                const res = await fetch(`/api/studies?q=660001`);
                const results = await res.json();
                const acto = results.find((s: any) => s.codigo === 660001);

                if (acto) {
                    const val = acto.ub * activeDefaultPlan.nbu;
                    setSelectedStudies(prev => [{
                        ...acto,
                        planId: activeDefaultPlan.id,
                        planNombre: activeDefaultPlan.nombre,
                        nbu: activeDefaultPlan.nbu,
                        valor: val
                    }, ...prev]);
                }
            } catch (error) {
                console.error("Error auto-adding Acto Bioquímico:", error);
            }
        };

        addActoBioquimico();
    }, [defaultPlanId, activeDefaultPlan, changePlanForItem]);

    const addStudy = (study: Study) => {
        if (!defaultPlanId) {
            alert("Por favor selecciona un plan por defecto primero para calcular el valor inicial.");
            return;
        }

        const exists = selectedStudies.find(s => s.id === study.id);
        if (exists) return;

        const val = study.ub * (activeDefaultPlan?.nbu || 0);
        setSelectedStudies(prev => [{
            ...study,
            planId: activeDefaultPlan!.id,
            planNombre: activeDefaultPlan!.nombre,
            nbu: activeDefaultPlan!.nbu,
            valor: val
        }, ...prev]);
        setSearchStudy("");
        setStudies([]);
    };

    const removeStudy = (id: string) => {
        setSelectedStudies(prev => prev.filter(s => s.id !== id));
    };

    const total = selectedStudies.reduce((acc, s) => acc + s.valor, 0);

    const handleSave = async (andSend = false) => {
        if (selectedStudies.length === 0) return;
        if (andSend && !email) {
            alert("Para enviar el presupuesto se requiere un email.");
            return;
        }

        setSaving(true);
        if (andSend) setSending(true);

        try {
            const res = await fetch("/api/budgets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paciente,
                    telefono,
                    email,
                    planId: defaultPlanId || null,
                    labId: localStorage.getItem('selectedLaboratoryId') || '',
                    total,
                    items: selectedStudies.map(s => ({
                        studyId: s.id,
                        codigo: s.codigo,
                        nombre: s.determinacion,
                        ub: s.ub,
                        planId: s.planId,
                        planNombre: s.planNombre,
                        valor: s.valor
                    }))
                })
            });

            if (res.ok) {
                const data = await res.json();
                const budgetId = data.id;

                if (andSend) {
                    const sendRes = await fetch(`/api/budgets/${budgetId}/send-email`, { method: "POST" });
                    if (!sendRes.ok) {
                        alert("Presupuesto guardado pero hubo un error al enviar el email.");
                    }
                }

                router.push("/admin/presupuestos");
                router.refresh();
            } else {
                alert("Error al guardar el presupuesto.");
            }
        } catch (error) {
            alert("Error de conexión al servidor.");
        } finally {
            setSaving(false);
            setSending(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-5">
                <div className="flex items-center gap-4">
                    <Link href="/admin/presupuestos" className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 transition-colors shrink-0">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Nuevo Presupuesto</h1>
                        <p className="text-xs md:text-sm text-zinc-500 font-medium tracking-tight">Cruce de determinaciones y planes</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => handleSave(false)}
                        disabled={saving || selectedStudies.length === 0}
                        className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    >
                        {saving && !sending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Guardar
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        disabled={saving || selectedStudies.length === 0}
                        className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                        {sending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                        Guardar y Enviar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Config */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Paciente y Plan Base */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-4xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <ShieldCheck size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Información</span>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-500">Paciente (opcional)</label>
                            <input
                                value={paciente}
                                onChange={(e) => setPaciente(e.target.value)}
                                placeholder="Ej: Juan Pérez"
                                className="w-full h-11 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-zinc-900 transition-all placeholder:text-zinc-400"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-500">Teléfono</label>
                            <input
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                placeholder="Ej: 11 1234 5678"
                                className="w-full h-11 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-zinc-900 transition-all placeholder:text-zinc-400"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-500">Email</label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Ej: paciente@mail.com"
                                className="w-full h-11 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-zinc-900 transition-all placeholder:text-zinc-400"
                            />
                        </div>
                        <div className="space-y-1.5 pt-2">
                            <label className="text-sm font-medium text-zinc-500">Plan por defecto</label>
                            <select
                                value={defaultPlanId}
                                onChange={(e) => setDefaultPlanId(e.target.value)}
                                className="w-full h-11 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-zinc-900 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Seleccionar plan...</option>
                                {plans.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre} (NBU: ${p.nbu})</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-zinc-400 mt-1 italic">Este plan se asignará a los nuevos estudios que agregues.</p>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-black text-white p-8 rounded-4xl shadow-xl space-y-6">
                        <div className="space-y-1">
                            <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Total Estimado</span>
                            <div className="text-4xl font-bold tracking-tight">
                                ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="pt-4 border-t border-white/10 space-y-3">
                            <div className="flex justify-between text-sm text-zinc-400">
                                <span>Total Determinaciones</span>
                                <span>{selectedStudies.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Items */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Add Study */}
                    <div className="relative">
                        <div className="relative">
                            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                value={searchStudy}
                                onChange={(e) => setSearchStudy(e.target.value)}
                                placeholder="Buscar determinante por nombre o código..."
                                className="w-full h-14 pl-14 pr-6 bg-white dark:bg-zinc-900 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white/20 rounded-3xl text-base shadow-sm outline-none transition-all"
                            />
                        </div>

                        {/* Dropdown Results */}
                        <AnimatePresence>
                            {studies.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-2xl z-10 max-h-64 overflow-y-auto overflow-x-hidden p-2 custom-scrollbar"
                                >
                                    {studies.map(study => (
                                        <button
                                            key={study.id}
                                            onClick={() => addStudy(study)}
                                            className="w-full flex items-center gap-4 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl transition-colors text-left"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                                <FlaskConical size={16} className="text-zinc-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold truncate">{study.determinacion}</div>
                                                <div className="text-[10px] text-zinc-400 font-mono">Cód: {study.codigo} • UB: {study.ub}</div>
                                            </div>
                                            <Plus size={16} className="text-zinc-300 mr-2" />
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* List of study items */}
                    <div className="bg-white dark:bg-zinc-900 rounded-4xl border border-zinc-100 dark:border-zinc-800 shadow-sm min-h-[400px]">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                            <h3 className="font-bold flex items-center gap-2">
                                <Receipt size={16} className="text-zinc-400" />
                                Detalle de Determinaciones
                            </h3>
                        </div>

                        <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                            {selectedStudies.length > 0 ? (
                                selectedStudies.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-zinc-50/50 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-400 font-mono text-[10px]">
                                            {item.codigo}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold truncate leading-tight">{item.determinacion}</div>
                                            <div className="mt-1">
                                                <select
                                                    value={item.planId}
                                                    onChange={(e) => changePlanForItem(item.id, e.target.value)}
                                                    className="bg-transparent text-[11px] font-bold text-zinc-400 outline-none hover:text-zinc-600 transition-colors cursor-pointer"
                                                >
                                                    {plans.map(p => (
                                                        <option key={p.id} value={p.id}>{p.nombre} (NBU: ${p.nbu})</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-zinc-400 font-medium mb-0.5">{item.ub} UB</div>
                                            <div className="text-sm font-bold font-mono">
                                                ${item.valor.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeStudy(item.id)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-300 hover:text-rose-500 hover:bg-rose-50 transition-all ml-2"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center space-y-4">
                                    <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-300">
                                        <FlaskConical size={32} />
                                    </div>
                                    <div className="max-w-[240px] mx-auto">
                                        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Empezá a agregar estudios</p>
                                        <p className="text-xs text-zinc-400 mt-1">Buscá los análisis arriba por nombre o código para incluirlos en el presupuesto.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e4e4e7;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #27272a;
                }
            `}</style>
        </div>
    );
}
