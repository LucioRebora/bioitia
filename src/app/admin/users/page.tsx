"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/users")
            .then((res) => res.json())
            .then((data) => {
                setUsers(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8 tracking-tight">Manejo de Usuarios</h1>

                    <div className="glass-card rounded-4xl overflow-hidden border border-zinc-100 dark:border-zinc-900">
                        {loading ? (
                            <div className="p-20 text-center text-zinc-500">Cargando usuarios...</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-900">
                                        <th className="px-8 py-4 font-semibold text-sm">Nombre</th>
                                        <th className="px-8 py-4 font-semibold text-sm">Email</th>
                                        <th className="px-8 py-4 font-semibold text-sm">Rol</th>
                                        <th className="px-8 py-4 font-semibold text-sm">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <tr key={user.id} className="border-b border-zinc-50 dark:border-zinc-900/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                                                <td className="px-8 py-4 text-sm">{user.name || "-"}</td>
                                                <td className="px-8 py-4 text-sm font-medium">{user.email}</td>
                                                <td className="px-8 py-4 text-sm">
                                                    <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold uppercase tracking-wider">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 text-sm text-zinc-500">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-20 text-center text-zinc-400">No hay usuarios registrados.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
