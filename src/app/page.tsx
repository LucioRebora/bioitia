import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-emerald-500">bio.itia</h1>
          <p className="text-zinc-500 mt-4 font-light tracking-wide uppercase text-sm">Sistema de Gestión para Laboratorios Bioquímicos</p>
        </div>

      </main>
      <Footer />
    </div>
  );
}


