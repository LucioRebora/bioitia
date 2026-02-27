export default function AdminPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <div className="space-y-4">
                <h1 className="text-5xl font-extrabold tracking-tighter text-zinc-900 dark:text-zinc-50 sm:text-6xl">
                    bienvenidos a <span className="text-emerald-500">bio.itia</span>
                </h1>
                <p className="text-lg text-zinc-500 font-medium tracking-wide">
                    Sistema de Gestión para Laboratorios Bioquímicos
                </p>
                <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full opacity-50" />
            </div>
        </div>
    );
}
