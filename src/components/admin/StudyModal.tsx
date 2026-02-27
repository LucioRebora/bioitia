"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

type StudyValues = {
    codigo: number;
    determinacion: string;
    urgencia: boolean;
    ref: string;
    ub: number;
    frecuencia: string;
};

export interface Study {
    id: string;
    codigo: number;
    determinacion: string;
    urgencia: boolean;
    ref: string | null;
    ub: number;
    frecuencia: string | null;
    createdAt: string;
}

interface StudyModalProps {
    study: Study | null;
    open: boolean;
    onClose: () => void;
    onSaved: (study: Study) => void;
}

export function StudyModal({ study, open, onClose, onSaved }: StudyModalProps) {
    const isEdit = !!study;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<StudyValues>();

    useEffect(() => {
        if (open) {
            reset(
                study
                    ? {
                        codigo: study.codigo,
                        determinacion: study.determinacion,
                        urgencia: study.urgencia,
                        ref: study.ref ?? "",
                        ub: study.ub,
                        frecuencia: study.frecuencia ?? "",
                    }
                    : {
                        codigo: undefined,
                        determinacion: "",
                        urgencia: false,
                        ref: "",
                        ub: undefined,
                        frecuencia: "",
                    }
            );
        }
    }, [study, open, reset]);

    const onSubmit = async (data: StudyValues) => {
        const url = isEdit ? `/api/studies/${study!.id}` : "/api/studies";
        const method = isEdit ? "PATCH" : "POST";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...data,
                codigo: Number(data.codigo),
                ub: Number(data.ub),
                urgencia: Boolean(data.urgencia),
            }),
        });

        if (res.ok) {
            const saved = await res.json();
            onSaved(saved);
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
                        <div className="bg-white dark:bg-zinc-900 rounded-4xl shadow-2xl border border-zinc-100 dark:border-zinc-800 w-full max-w-lg p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold">
                                    {isEdit ? "Editar Estudio" : "Nuevo Estudio"}
                                </h2>
                                <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                    <X size={18} className="text-zinc-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                {/* Row 1: Codigo + Urgencia */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-sm font-medium text-zinc-500">Código</label>
                                        <input
                                            {...register("codigo", { required: true, valueAsNumber: true })}
                                            type="number"
                                            placeholder="660001"
                                            className={inputClass(!!errors.codigo)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-zinc-500">Urgencia</label>
                                        <div className="h-11 flex items-center px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    {...register("urgencia")}
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded accent-black"
                                                />
                                                <span className="text-sm text-zinc-600 dark:text-zinc-400">Sí (U)</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Determinación */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-zinc-500">Determinación</label>
                                    <input
                                        {...register("determinacion", { required: true })}
                                        placeholder="GRUPO SANGUINEO (Sistema ABO)"
                                        className={inputClass(!!errors.determinacion)}
                                    />
                                    {errors.determinacion && (
                                        <p className="text-xs text-rose-500 px-1">Requerida</p>
                                    )}
                                </div>

                                {/* Row 2: Ref + UB */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-zinc-500">Ref.</label>
                                        <input
                                            {...register("ref")}
                                            placeholder="N"
                                            className={inputClass()}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-zinc-500">U.B.</label>
                                        <input
                                            {...register("ub", { required: true, valueAsNumber: true })}
                                            type="number"
                                            step="0.01"
                                            placeholder="3"
                                            className={inputClass(!!errors.ub)}
                                        />
                                    </div>
                                </div>

                                {/* Frecuencia */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-zinc-500">Frecuencia</label>
                                    <input
                                        {...register("frecuencia")}
                                        placeholder="PMO"
                                        className={inputClass()}
                                    />
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
