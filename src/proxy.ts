import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { locales, defaultLocale, type Locale } from "@/lib/i18n";

const LOCALE_COOKIE = "NEXT_LOCALE";

function detectLocale(req: NextRequest): Locale {
  const cookieLocale = req.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale === "de" || cookieLocale === "en") return cookieLocale;

  // Device/browser language, e.g. "en-US,en;q=0.9,de;q=0.8" -> "en"
  const acceptLanguage = req.headers.get("accept-language") ?? "";
  const preferred = acceptLanguage.split(",")[0]?.trim().slice(0, 2).toLowerCase();
  return preferred === "en" ? "en" : defaultLocale;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin");
  const isWebdevLoginPage = pathname === "/bierp4a4/login";

  if (isWebdevLoginPage) {
    if (req.auth) {
      return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (isAdminRoute) {
    if (!isLoginPage && !req.auth) {
      const loginUrl = new URL("/admin/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (isLoginPage && req.auth) {
      return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const localeInPath = locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));

  if (!localeInPath) {
    const locale = detectLocale(req);
    const redirectUrl = new URL(
      `/${locale}${pathname === "/" ? "" : pathname}${req.nextUrl.search}`,
      req.nextUrl.origin,
    );
    return NextResponse.redirect(redirectUrl);
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-locale", localeInPath);
  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|icon\\.png|opengraph-image\\.jpg|robots\\.txt|sitemap\\.xml).*)"],
};
