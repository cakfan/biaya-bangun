import { streamText } from "ai";
import type { BuildingCostEstimate } from "@/lib/calculation/types";
import type { EstimateSummary } from "@/components/estimate-result";
import { createEstimateModel } from "./openrouter-client";
import { buildEstimateContext } from "./build-estimate-context";
import { SYSTEM_PROMPT } from "./system-prompt";
import { guardUserMessage, wrapUserInput } from "./prompt-injection-guard";

export const AI_TEMPERATURE = 0.3;
export const AI_MAX_OUTPUT_TOKENS = 1000;
export type AiChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatRequestPayload = {
  estimate: BuildingCostEstimate;
  summary: EstimateSummary;
  messages: AiChatMessage[];
};

export type ChatValidation =
  | { ok: true; request: ChatRequestPayload }
  | { ok: false; status: number; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEstimate(value: unknown): value is BuildingCostEstimate {
  return (
    isRecord(value) &&
    Array.isArray(value.components) &&
    typeof value.totalCost === "number" &&
    typeof value.buildingArea === "number"
  );
}

export function validateChatRequest(body: unknown): ChatValidation {
  if (!isRecord(body) || !isEstimate(body.estimate)) {
    return { ok: false, status: 400, message: "Data estimasi tidak valid." };
  }
  const summary = body.summary;
  if (!isRecord(summary) || typeof summary.buildingTypeName !== "string" || typeof summary.city !== "string") {
    return { ok: false, status: 400, message: "Ringkasan estimasi tidak valid." };
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return { ok: false, status: 400, message: "Tidak ada pesan yang dikirim." };
  }

  const messages: AiChatMessage[] = [];
  for (const raw of body.messages) {
    if (!isRecord(raw) || (raw.role !== "user" && raw.role !== "assistant")) {
      return { ok: false, status: 400, message: "Format pesan tidak valid." };
    }
    if (typeof raw.content !== "string") {
      return { ok: false, status: 400, message: "Isi pesan tidak valid." };
    }
    if (raw.role === "user") {
      const guard = guardUserMessage(raw.content);
      if (!guard.ok) {
        return { ok: false, status: 400, message: guard.reason };
      }
      messages.push({ role: "user", content: guard.sanitized });
    } else {
      messages.push({ role: "assistant", content: raw.content });
    }
  }

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== "user") {
    return { ok: false, status: 400, message: "Pesan terakhir harus dari pengguna." };
  }

  const safeSummary: EstimateSummary = {
    buildingTypeName: String(summary.buildingTypeName),
    city: String(summary.city),
  };

  return { ok: true, request: { estimate: body.estimate, summary: safeSummary, messages } };
}

export function streamEstimateChat(
  request: ChatRequestPayload,
  abortSignal: AbortSignal,
): Response {
  const context = buildEstimateContext(request.estimate, request.summary);
  const system = `${SYSTEM_PROMPT}\n\nDATA ESTIMASI:\n${context}`;

  const messages = request.messages.map((message) =>
    message.role === "user"
      ? { role: "user" as const, content: wrapUserInput(message.content) }
      : { role: "assistant" as const, content: message.content },
  );

  const result = streamText({
    model: createEstimateModel(),
    system,
    messages,
    temperature: AI_TEMPERATURE,
    maxOutputTokens: AI_MAX_OUTPUT_TOKENS,
    abortSignal,
    onError: (error) => {
      console.error("[ai-chat] error:", error);
    },
  });

  return result.toTextStreamResponse();
}
