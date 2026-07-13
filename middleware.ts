import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

const PUBLIC_PATHS = new Set(["/login"]);

function unauthorized(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (PUBLIC_PATHS.has(path) || path.startsWith("/api/auth/")) return NextResponse.next();

  const token = req.cookies.get("complylens_session")?.value;
  if (!token) return unauthorized(req);

  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Server authentication is not configured" }, { status: 503 });
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret || "development-only-change-this-secret"));
    return NextResponse.next();
  } catch {
    const response = unauthorized(req);
    response.cookies.set("complylens_session", "", { expires: new Date(0), path: "/" });
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
