import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy Next.js (anciennement "middleware", renommé dans Next 16) — deux rôles :
 *
 * 1. **Rafraîchir le token Supabase** à chaque requête (sinon les sessions
 *    longues expirent silencieusement). Pattern officiel `@supabase/ssr`.
 *
 * 2. **Protéger /admin/*** : redirige vers /login si l'utilisateur n'est pas
 *    authentifié. Le check du rôle `admin` se fait côté server component
 *    (cf. /admin/layout.tsx) pour avoir accès aux jointures.
 *
 * Doc : node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // Refresh la session si nécessaire (lit & réécrit les cookies)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/login";

  // Pas connecté + tentative d'accès à /admin → redirect /login?next=...
  if (isAdminRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Connecté + tentative d'accès à /login → redirect /admin
  if (isLoginRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match toutes les routes SAUF :
     *  - _next/static (assets statiques)
     *  - _next/image (images optimisées)
     *  - favicon.ico, sw.js, manifest
     *  - /media/* (médias publiques)
     *  - /admin/index.html (Decap legacy, retiré à terme)
     */
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|media|admin/index|admin/config).*)",
  ],
};
