import { NextResponse } from "next/server";
import { streamEstimateChat, validateChatRequest } from "@/lib/ai/chat";
import { chatRateLimiter } from "@/lib/ai/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request): Promise<Response> {
  const clientKey = getClientKey(request);
  if (!chatRateLimiter.allow(clientKey)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body permintaan bukan JSON yang valid." }, { status: 400 });
  }

  const validation = validateChatRequest(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.message }, { status: validation.status });
  }

  try {
    return streamEstimateChat(validation.request, request.signal);
  } catch (error) {
    console.error("[ai-chat] gagal memulai stream:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat menyiapkan asisten AI.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
