"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

const editUserSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    email: z.string().email("Email inválido"),
    role: z.enum(["USER", "ADMIN"]),
    password: z.string().optional(),
});

type EditUserValues = z.infer<typeof editUserSchema>;

export interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    active: boolean;
    createdAt: string;
}

interface EditUserModalProps {
    user: User | null;
    open: boolean;
    onClose: () => void;
    onSaved: (updated: User) => void;
}

export function EditUserModal({ user, open, onClose, onSaved }: EditUserModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<EditUserValues>({
        resolver: zodResolver(editUserSchema),
    });

    // Populate form when user changes
    useEffect(() => {
        if (user) {
            reset({
                name: user.name ?? "",
                email: user.email,
                role: user.role as "USER" | "ADMIN",
                password: "",
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: EditUserValues) => {
        if (!user) return;

        const payload: Record<string, string> = {
            name: data.name,
            email: data.email,
            role: data.role,
        };
        if (data.password && data.password.length > 0) {
            payload.password = data.password;
        }

        const res = await fetch(`/api/users/${user.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            const updated = await res.json();
            onSaved(updated);
            onClose();
        }
    };

    const inputClass = (hasError: boolean) =>
        cn(
            "w-full h-11 bg-zinc-50 dark:bg-zinc-800 border rounded-2xl px-4 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400 transition-all text-sm placeholder:text-zinc-400",
            hasError
                ? "border-rose-400 dark:border-rose-600"
                : "border-zinc-200 dark:border-zinc-700"
        );

    return (
        <AnimatePresence>
            {open && user && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 12 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 flex items-center justify-center z-50 px-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white dark:bg-zinc-900 rounded-4xl shadow-2xl border border-zinc-100 dark:border-zinc-800 w-full max-w-md p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-bold">Editar Usuario</h2>
                                    <p className="text-sm text-zinc-500 mt-0.5">{user.email}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <X size={18} className="text-zinc-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                {/* Nombre */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-zinc-500">Nombre</label>
                                    <input
                                        {...register("name")}
                                        placeholder="Nombre completo"
                                        className={inputClass(!!errors.name)}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-rose-500 px-1">{errors.name.message}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-zinc-500">Email</label>
                                    <input
                                        {...register("email")}
                                        type="email"
                                        placeholder="email@ejemplo.com"
                                        className={inputClass(!!errors.email)}
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-rose-500 px-1">{errors.email.message}</p>
                                    )}
                                </div>

                                {/* Rol */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-zinc-500">Rol</label>
                                    <select
                                        {...register("role")}
                                        className={inputClass(!!errors.role)}
                                    >
                                        <option value="USER">Usuario</option>
                                        <option value="ADMIN">Administrador</option>
                                    </select>
                                </div>

                                {/* Contraseña (opcional) */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-zinc-500">
                                        Nueva contraseña{" "}
                                        <span className="text-zinc-400 font-normal">(dejar vacío para no cambiar)</span>
                                    </label>
                                    <input
                                        {...register("password")}
                                        type="password"
                                        placeholder="••••••••"
                                        className={inputClass(false)}
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
                                        {isSubmitting ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <>
                                                <Save size={15} />
                                                Guardar
                                            </>
                                        )}
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
