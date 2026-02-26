"use client";

import React, { useState, useEffect } from "react";
import { Users, Pencil } from "lucide-react";
import { EditUserModal, type User } from "@/components/admin/EditUserModal";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const loadUsers = () => {
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
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setModalOpen(true);
    };

    const handleSaved = (updated: User) => {
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    };

    return (
        <>
            <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                    <Users size={22} className="text-zinc-400" />
                    <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-4xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    {loading ? (
                        <div className="p-20 text-center text-zinc-400 text-sm">Cargando usuarios...</div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                                    <th className="px-8 py-4 font-semibold text-zinc-500">Nombre</th>
                                    <th className="px-8 py-4 font-semibold text-zinc-500">Email</th>
                                    <th className="px-8 py-4 font-semibold text-zinc-500">Rol</th>
                                    <th className="px-8 py-4 font-semibold text-zinc-500">Fecha</th>
                                    <th className="px-8 py-4 font-semibold text-zinc-500 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                                        >
                                            <td className="px-8 py-4">{user.name || "—"}</td>
                                            <td className="px-8 py-4 font-medium">{user.email}</td>
                                            <td className="px-8 py-4">
                                                <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold uppercase tracking-wider">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-zinc-500">
                                                {new Date(user.createdAt).toLocaleDateString("es-AR")}
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                                >
                                                    <Pencil size={13} />
                                                    Editar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center text-zinc-400">
                                            No hay usuarios registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <EditUserModal
                user={editingUser}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSaved={handleSaved}
            />
        </>
    );
}
