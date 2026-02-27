"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard,
    Users,
    FlaskConical,
    ChevronLeft,
    ChevronRight,
    LogOut,
    CreditCard,
    Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        label: "Usuarios",
        href: "/admin/users",
        icon: Users,
    },
    {
        label: "Estudios",
        href: "/admin/estudios",
        icon: FlaskConical,
    },
    {
        label: "Planes",
        href: "/admin/planes",
        icon: CreditCard,
    },
    {
        label: "Presupuestos",
        href: "/admin/presupuestos",
        icon: Receipt,
    },
];


export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <motion.aside
            animate={{ width: collapsed ? 72 : 240 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="relative flex flex-col h-screen bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-900 shrink-0 overflow-hidden"
        >
            {/* Logo */}
            <div className="flex items-center h-16 px-5 border-b border-zinc-100 dark:border-zinc-900 shrink-0">
                <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 bg-black dark:bg-white rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-white dark:text-black font-bold text-xs">B</span>
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8 }}
                                transition={{ duration: 0.15 }}
                                className="font-bold text-lg tracking-tight whitespace-nowrap"
                            >
                                bioitia<span className="text-zinc-400">.</span>
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-150 group cursor-pointer",
                                    isActive
                                        ? "bg-black dark:bg-white text-white dark:text-black"
                                        : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
                                )}
                            >
                                <item.icon size={19} className="shrink-0" />
                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.1 }}
                                            className="text-sm font-medium whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-3 pb-6 space-y-1 shrink-0 border-t border-zinc-100 dark:border-zinc-900 pt-4">
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-zinc-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150"
                >
                    <LogOut size={19} className="shrink-0" />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.1 }}
                                className="text-sm font-medium whitespace-nowrap"
                            >
                                Salir
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10"
            >
                {collapsed ? (
                    <ChevronRight size={12} className="text-zinc-500" />
                ) : (
                    <ChevronLeft size={12} className="text-zinc-500" />
                )}
            </button>
        </motion.aside>
    );
}
