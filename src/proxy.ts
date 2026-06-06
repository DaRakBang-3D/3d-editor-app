import { NextRequest, NextResponse } from "next/server"

// remoteEntry.js 로드를 허용할 host 목록
const ALLOWED_ORIGINS = [
  "https://app.darackbbang.com",
  "http://localhost:3000",
]

export function proxy(req: NextRequest) {
  const origin = req.headers.get("origin") ?? ""
  const res = NextResponse.next()

  if (ALLOWED_ORIGINS.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin)
    res.headers.set("Access-Control-Allow-Methods", "GET")
    res.headers.set("Vary", "Origin")
  }

  return res
}

// MF 청크 파일 경로에만 적용
export const config = {
  matcher: ["/_next/static/chunks/:path*"],
}
