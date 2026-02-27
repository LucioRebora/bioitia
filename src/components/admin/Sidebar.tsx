"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import {
    Home,
    Users,
    FlaskConical,
    ChevronLeft,
    ChevronRight,
    LogOut,
    CreditCard,
    Receipt,
    UserCircle,
    Settings,
    ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    {
        label: "Inicio",
        href: "/admin",
        icon: Home,
    },
    {
        label: "Presupuestos",
        href: "/admin/presupuestos",
        icon: Receipt,
    },
    {
        label: "Configuraciones",
        icon: Settings,
        subItems: [
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
                label: "Usuarios",
                href: "/admin/users",
                icon: Users,
            },
        ],
    },
];


export function Sidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [configOpen, setConfigOpen] = useState(true);

    return (
        <motion.aside
            animate={{ width: collapsed ? 72 : 240 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="relative flex flex-col h-screen bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-900 shrink-0 overflow-hidden"
        >
            {/* Logo */}
            <div className="flex items-center h-16 px-5 border-b border-zinc-100 dark:border-zinc-900 shrink-0">
                <Link href="/admin" className="flex items-center min-h-[2rem]">
                    <AnimatePresence mode="wait">
                        {!collapsed ? (
                            <motion.span
                                key="full-logo"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8 }}
                                transition={{ duration: 0.15 }}
                                className="font-bold text-xl tracking-tight whitespace-nowrap text-emerald-500"
                            >
                                bio.itia
                            </motion.span>
                        ) : (
                            <motion.span
                                key="small-logo"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="font-bold text-xl text-emerald-500"
                            >
                                b.
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const hasSubItems = !!item.subItems;
                    const isActive = item.href ? pathname === item.href : false;
                    const isAnySubItemActive = item.subItems?.some(si => pathname === si.href);

                    if (hasSubItems) {
                        return (
                            <div key={item.label} className="space-y-1">
                                <button
                                    onClick={() => !collapsed && setConfigOpen(!configOpen)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-150 group cursor-pointer",
                                        isAnySubItemActive && collapsed
                                            ? "bg-black dark:bg-white text-white dark:text-black"
                                            : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
                                    )}
                                >
                                    <item.icon size={19} className="shrink-0" />
                                    {!collapsed && (
                                        <>
                                            <span className="text-sm font-medium flex-1 text-left whitespace-nowrap">
                                                {item.label}
                                            </span>
                                            <motion.div
                                                animate={{ rotate: configOpen ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronDown size={14} className="opacity-50" />
                                            </motion.div>
                                        </>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {!collapsed && configOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden flex flex-col gap-1 pl-4"
                                        >
                                            {item.subItems?.map((sub) => {
                                                const isSubActive = pathname === sub.href;
                                                return (
                                                    <Link key={sub.href} href={sub.href}>
                                                        <div
                                                            className={cn(
                                                                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 cursor-pointer",
                                                                isSubActive
                                                                    ? "text-emerald-500 font-bold"
                                                                    : "text-zinc-400 hover:text-black dark:hover:text-white"
                                                            )}
                                                        >
                                                            <sub.icon size={16} className="shrink-0" />
                                                            <span className="text-sm whitespace-nowrap">
                                                                {sub.label}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    }

                    return (
                        <Link key={item.href} href={item.href!}>
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
            <div className="px-3 pb-6 shrink-0 border-t border-zinc-100 dark:border-zinc-900 pt-4">
                <div className={cn(
                    "flex items-center gap-2 px-2 py-2 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50",
                    collapsed ? "flex-col py-4 gap-4" : "flex-row"
                )}>
                    {/* User Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                            <UserCircle size={20} className="text-zinc-500" />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                    {session?.user?.name || "Usuario"}
                                </span>
                                <span className="text-[10px] text-zinc-500 truncate">
                                    {session?.user?.email}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        title="Cerrar sesión"
                        className={cn(
                            "flex items-center justify-center p-2 rounded-xl text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-150",
                            collapsed ? "w-full" : "shrink-0"
                        )}
                    >
                        <LogOut size={18} />
                    </button>
                </div>
                <div className="mt-2 px-2 flex justify-center">
                    <span className="text-[10px] font-mono text-zinc-400 opacity-50">
                        v1.0.7
                    </span>
                </div>
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
