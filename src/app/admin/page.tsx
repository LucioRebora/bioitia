import { LayoutDashboard } from "lucide-react";

export default function AdminDashboard() {
    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
                <LayoutDashboard size={22} className="text-zinc-400" />
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            </div>
            <div className="glass-card rounded-4xl p-10 text-center text-zinc-400">
                <p className="text-sm">Panel en construcción. Selecciona un módulo del sidebar.</p>
            </div>
        </div>
    );
}
