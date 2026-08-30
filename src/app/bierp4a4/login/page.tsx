import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export const metadata = { title: "Webdev-Login" };

async function loginAction(formData: FormData) {
  "use server";
  const callbackUrl = (formData.get("callbackUrl") as string) || "/admin";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/bierp4a4/login?error=1&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    throw error;
  }
}

export default async function WebdevLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "1";
  const callbackUrl = params.callbackUrl || "/admin";

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-soft px-6">
      <form
        action={loginAction}
        className="w-full max-w-[380px] bg-white border border-line rounded-[2px] p-8 shadow-[0_18px_40px_-20px_rgba(44,50,38,0.35)]"
      >
        <span className="block font-serif text-[1.15rem] text-forest mb-1">AUSZEIT</span>
        <h1 className="text-[1.4rem] mb-6">Webdev-Login</h1>

        <input type="hidden" name="callbackUrl" value={callbackUrl} />

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

        <div className="mb-5">
          <label htmlFor="password" className="block text-[0.7rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5">
            Passwort
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="w-full px-3 py-[11px] border border-line rounded-[2px] font-sans text-[0.92rem] bg-bg text-ink focus:outline-2 focus:outline-gold focus:outline-offset-1"
          />
        </div>

        {hasError && (
          <p className="text-[0.85rem] text-[#a13c2f] mb-4">
            E-Mail oder Passwort ist nicht korrekt.
          </p>
        )}

        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 px-[30px] py-[14px] bg-forest text-white font-sans text-[0.78rem] tracking-[0.14em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors"
        >
          Anmelden
        </button>
      </form>
    </div>
  );
}
