"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

type PlanValues = {
    nombre: string;
    nbu: number;
};

export interface Plan {
    id: string;
    nombre: string;
    nbu: number;
    createdAt: string;
    updatedAt: string;
}

interface PlanModalProps {
    plan: Plan | null;
    open: boolean;
    onClose: () => void;
    onSaved: (plan: Plan) => void;
}

export function PlanModal({ plan, open, onClose, onSaved }: PlanModalProps) {
    const isEdit = !!plan;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PlanValues>();

    useEffect(() => {
        if (open) {
            reset(
                plan
                    ? {
                        nombre: plan.nombre,
                        nbu: plan.nbu,
                    }
                    : {
                        nombre: "",
                        nbu: "" as any,
                    }
            );
        }
    }, [plan, open, reset]);

    const onSubmit = async (data: PlanValues) => {
        const url = isEdit ? `/api/plans/${plan!.id}` : "/api/plans";
        const method = isEdit ? "PATCH" : "POST";

        const labId = localStorage.getItem('selectedLaboratoryId') || '';

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...data,
                nbu: Number(data.nbu),
                labId
            }),
        });

        if (res.ok) {
            const saved = await res.json();
            onSaved(saved);
            reset(); // Limpiar el formulario explícitamente
            onClose();
        }
    };

    const inputClass = (hasError?: boolean) =>
        cn(
            "w-full h-11 bg-zinc-50 dark:bg-zinc-800 border rounded-2xl px-4 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 transition-all text-sm placeholder:text-zinc-400",
            hasError ? "border-rose-400" : "border-zinc-200 dark:border-zinc-700"
        );

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 12 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 flex items-center justify-center z-50 px-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white dark:bg-zinc-900 rounded-4xl shadow-2xl border border-zinc-100 dark:border-zinc-800 w-full max-w-sm p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold">
                                    {isEdit ? "Editar Plan" : "Nuevo Plan"}
                                </h2>
                                <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                    <X size={18} className="text-zinc-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Nombre */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-zinc-500">Nombre del Plan</label>
                                    <input
                                        {...register("nombre", { required: true })}
                                        placeholder="OSDE 210"
                                        className={inputClass(!!errors.nombre)}
                                    />
                                    {errors.nombre && (
                                        <p className="text-xs text-rose-500 px-1">Requerido</p>
                                    )}
                                </div>

                                {/* NBU */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-zinc-500">Valor NBU ($)</label>
                                    <input
                                        {...register("nbu", { required: true, min: 0, valueAsNumber: true })}
                                        type="number"
                                        step="0.01"
                                        placeholder="1500.00"
                                        className={inputClass(!!errors.nbu)}
                                    />
                                    {errors.nbu && (
                                        <p className="text-xs text-rose-500 px-1">Requerido (mínimo 0)</p>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 h-11 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 h-11 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <><Save size={15} />Guardar</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
