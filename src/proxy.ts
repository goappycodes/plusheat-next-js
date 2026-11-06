import { NextRequest, NextResponse } from "next/server";

/**
 * Keeps the ad click IDs in the same cookies the WordPress site used
 * (gclid, fbclid, mscklid), so checkout leads and Zoho subscriptions carry
 * "Google - …" / "Meta - …" / "Microsoft Bing - …" exactly as before.
 */
export function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const q = req.nextUrl.searchParams;
  const map: [string, string][] = [
    ["gclid", "gclid"],
    ["fbclid", "fbclid"],
    ["msclkid", "mscklid"],
  ];
  for (const [param, name] of map) {
    const v = q.get(param);
    if (v) res.cookies.set(name, v.slice(0, 200), { path: "/", maxAge: 60 * 60 * 24 * 90, sameSite: "lax" });
  }
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico).*)"],
};
