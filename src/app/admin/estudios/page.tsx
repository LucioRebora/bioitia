"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FlaskConical, Plus, Pencil, Trash2, Search, Zap } from "lucide-react";
import { StudyModal, type Study } from "@/components/admin/StudyModal";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminStudiesPage() {
    const [studies, setStudies] = useState<Study[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingStudy, setEditingStudy] = useState<Study | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<Study | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const load = useCallback(async (q = "") => {
        setLoading(true);
        try {
            const labId = localStorage.getItem('selectedLaboratoryId') || '';
            const res = await fetch(`/api/studies?q=${encodeURIComponent(q)}&labId=${labId}`);
            const data = await res.json();
            setStudies(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        const t = setTimeout(() => load(search), 300);
        return () => clearTimeout(t);
    }, [search, load]);

    const openNew = () => { setEditingStudy(null); setModalOpen(true); };
    const openEdit = (s: Study) => { setEditingStudy(s); setModalOpen(true); };

    const handleSaved = (saved: Study) => {
        setStudies((prev) => {
            const exists = prev.find((s) => s.id === saved.id);
            return exists
                ? prev.map((s) => (s.id === saved.id ? saved : s))
                : [saved, ...prev].sort((a, b) => a.codigo - b.codigo);
        });
    };

    const handleDelete = async (study: Study) => {
        setDeleteLoading(true);
        const res = await fetch(`/api/studies/${study.id}`, { method: "DELETE" });
        if (res.ok) {
            setStudies((prev) => prev.filter((s) => s.id !== study.id));
        }
        setDeleteLoading(false);
        setConfirmDelete(null);
    };

    return (
        <>
            <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <FlaskConical size={22} className="text-zinc-400" />
                        <h1 className="text-2xl font-bold tracking-tight">Estudios</h1>
                        <span className="text-sm text-zinc-400">({studies.length})</span>
                    </div>
                    <button
                        onClick={openNew}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                    >
                        <Plus size={16} /> Nuevo estudio
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-6 max-w-sm">
                    <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por determinación o código..."
                        className="w-full h-11 pl-10 pr-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 transition-all placeholder:text-zinc-400"
                    />
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-4xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    {loading ? (
                        <div className="p-20 text-center text-zinc-400 text-sm">Cargando estudios...</div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                    <th className="px-5 py-4 font-semibold text-zinc-500 w-24">Código</th>
                                    <th className="px-5 py-4 font-semibold text-zinc-500">Determinación</th>
                                    <th className="px-5 py-4 font-semibold text-zinc-500 text-center w-20">Urg.</th>
                                    <th className="px-5 py-4 font-semibold text-zinc-500 text-center w-16">Ref.</th>
                                    <th className="px-5 py-4 font-semibold text-zinc-500 text-right w-16">U.B.</th>
                                    <th className="px-5 py-4 font-semibold text-zinc-500 text-center w-24">Frecuencia</th>
                                    <th className="px-5 py-4 font-semibold text-zinc-500 text-right w-24">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studies.length > 0 ? (
                                    studies.map((study) => (
                                        <tr
                                            key={study.id}
                                            className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                                        >
                                            <td className="px-5 py-3 font-mono text-xs text-zinc-500">{study.codigo}</td>
                                            <td className="px-5 py-3 font-medium">{study.determinacion}</td>
                                            <td className="px-5 py-3 text-center">
                                                {study.urgencia ? (
                                                    <span title="Urgente" className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 dark:bg-amber-950/30">
                                                        <Zap size={12} className="text-amber-500" />
                                                    </span>
                                                ) : (
                                                    <span className="text-zinc-300 dark:text-zinc-700">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-center text-zinc-500 text-xs">{study.ref || "—"}</td>
                                            <td className="px-5 py-3 text-right font-mono text-zinc-600 dark:text-zinc-400 text-xs">{study.ub}</td>
                                            <td className="px-5 py-3 text-center">
                                                {study.frecuencia ? (
                                                    <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs">{study.frecuencia}</span>
                                                ) : "—"}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openEdit(study)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                                    >
                                                        <Pencil size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDelete(study)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-500 transition-colors"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-20 text-center text-zinc-400">
                                            {search ? `Sin resultados para "${search}"` : "No hay estudios cargados."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <StudyModal
                study={editingStudy}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSaved={handleSaved}
            />

            {/* Delete Confirm */}
            <AnimatePresence>
                {confirmDelete && (
                    <>
                        <motion.div
                            key="del-backdrop"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setConfirmDelete(null)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            key="del-modal"
                            initial={{ opacity: 0, scale: 0.96, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="fixed inset-0 flex items-center justify-center z-50 px-4"
                        >
                            <div className="bg-white dark:bg-zinc-900 rounded-4xl shadow-2xl border border-zinc-100 dark:border-zinc-800 w-full max-w-sm p-8 text-center">
                                <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-5">
                                    <Trash2 size={22} className="text-rose-500" />
                                </div>
                                <h2 className="text-lg font-bold mb-2">¿Eliminar estudio?</h2>
                                <p className="text-sm text-zinc-500 mb-8">
                                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{confirmDelete.determinacion}</span> será eliminado permanentemente.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setConfirmDelete(null)}
                                        className="flex-1 h-11 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(confirmDelete)}
                                        disabled={deleteLoading}
                                        className="flex-1 h-11 bg-rose-500 text-white rounded-2xl text-sm font-medium hover:bg-rose-600 transition-colors disabled:opacity-50"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
