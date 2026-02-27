import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center px-4 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tighter text-zinc-900 dark:text-zinc-50 sm:text-6xl">
            bienvenidos a <span className="text-emerald-500">bio.itia</span>
          </h1>
          <p className="text-lg text-zinc-500 font-medium tracking-wide">
            Sistema de Gestión para Laboratorios Bioquímicos
          </p>
          <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full opacity-50" />
        </div>
      </main>
      <Footer />
    </div>
  );
}


