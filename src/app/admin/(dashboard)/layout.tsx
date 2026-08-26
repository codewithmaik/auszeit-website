import Link from "next/link";
import { LogOut, LayoutDashboard, Home, Settings } from "lucide-react";
import { signOut } from "@/auth";

export const metadata = { title: { template: "%s — Admin", default: "Admin" } };

async function logoutAction() {
  "use server";
  await signOut({ redirectTo: "/admin/login" });
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-soft">
      <header className="bg-forest text-white">
        <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="font-serif text-[1.05rem] tracking-[0.08em]">
            AUSZEIT · Admin
          </Link>
          <nav className="flex items-center gap-6 text-[0.8rem] uppercase tracking-[0.06em]">
            <Link href="/admin" className="flex items-center gap-1.5 hover:text-gold transition-colors">
              <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />
              Übersicht
            </Link>
            <Link href="/admin/wohnungen" className="flex items-center gap-1.5 hover:text-gold transition-colors">
              <Home className="w-4 h-4" strokeWidth={1.5} />
              Wohnungen
            </Link>
            <Link href="/admin/einstellungen" className="flex items-center gap-1.5 hover:text-gold transition-colors">
              <Settings className="w-4 h-4" strokeWidth={1.5} />
              Einstellungen
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-white/80 hover:text-gold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
                Abmelden
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
