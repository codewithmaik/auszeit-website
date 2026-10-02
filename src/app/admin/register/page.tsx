import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { adminAccountExists, createAdminAccount } from "@/lib/auth-accounts";

export const metadata = { title: "Admin-Konto einrichten", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

async function registerAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (password !== passwordConfirm) {
    redirect("/admin/register?error=" + encodeURIComponent("Die Passwörter stimmen nicht überein."));
  }

  const result = await createAdminAccount(email, password);
  if (!result.ok) {
    redirect("/admin/register?error=" + encodeURIComponent(result.error));
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/admin" });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/admin/login");
    }
    throw error;
  }
}

export default async function AdminRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // Singleton: sobald ein Admin-Account existiert, ist diese Seite gesperrt.
  if (await adminAccountExists()) {
    redirect("/admin/login");
  }

  const params = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-soft px-6">
      <form
        action={registerAction}
        className="w-full max-w-[380px] bg-white border border-line rounded-[2px] p-8 shadow-[0_18px_40px_-20px_rgba(44,50,38,0.35)]"
      >
        <span className="block font-serif text-[1.15rem] text-forest mb-1">AUSZEIT</span>
        <h1 className="text-[1.4rem] mb-2">Admin-Konto einrichten</h1>
        <p className="text-[0.85rem] text-ink-soft mb-6">
          Dieses Formular funktioniert nur einmal — danach loggst du dich unter{" "}
          <span className="font-medium">/admin/login</span> mit diesen Zugangsdaten ein.
        </p>

        <div className="mb-4">
          <label htmlFor="email" className="block text-[0.7rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5">
            E-Mail
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autoFocus
            className="w-full px-3 py-[11px] border border-line rounded-[2px] font-sans text-[0.92rem] bg-bg text-ink focus:outline-2 focus:outline-gold focus:outline-offset-1"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-[0.7rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5">
            Passwort
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            minLength={8}
            className="w-full px-3 py-[11px] border border-line rounded-[2px] font-sans text-[0.92rem] bg-bg text-ink focus:outline-2 focus:outline-gold focus:outline-offset-1"
          />
        </div>

        <div className="mb-5">
          <label
            htmlFor="passwordConfirm"
            className="block text-[0.7rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5"
          >
            Passwort wiederholen
          </label>
          <input
            type="password"
            id="passwordConfirm"
            name="passwordConfirm"
            required
            minLength={8}
            className="w-full px-3 py-[11px] border border-line rounded-[2px] font-sans text-[0.92rem] bg-bg text-ink focus:outline-2 focus:outline-gold focus:outline-offset-1"
          />
        </div>

        {params.error && <p className="text-[0.85rem] text-[#a13c2f] mb-4">{params.error}</p>}

        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 px-[30px] py-[14px] bg-forest text-white font-sans text-[0.78rem] tracking-[0.14em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors"
        >
          Konto anlegen
        </button>
      </form>
    </div>
  );
}
