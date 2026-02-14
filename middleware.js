// middleware.js – Geo-detection for currency localization
// Uses domain as primary signal, Vercel IP header as fallback
import { NextResponse } from "next/server";

export function middleware(request) {
  const response = NextResponse.next();
  
  // Check if cookie already set (don't override user's manual choice)
  const existingRegion = request.cookies.get("ll_region")?.value;
  if (existingRegion) return response;
  
  // 1. Domain-based detection (strongest signal)
  const host = request.headers.get("host") || "";
  let region = null;
  if (host.endsWith(".de")) region = "EU";
  else if (host.endsWith(".at")) region = "EU";
  else if (host.endsWith(".ch")) region = "CH";
  
  // 2. Fallback: Vercel IP country header
  if (!region) {
    const country = request.headers.get("x-vercel-ip-country") || "";
    region = country === "CH" ? "CH" : "EU";
  }
  
  // Set cookie for 1 year
  response.cookies.set("ll_region", region, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  
  return response;
}

// Only run on page routes, not on API/static
export const config = {
  matcher: ["/", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
