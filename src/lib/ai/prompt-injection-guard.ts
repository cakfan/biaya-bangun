export const MAX_USER_MESSAGE_LENGTH = 2000;
export const USER_INPUT_OPEN_TAG = "[USER_INPUT]";
export const USER_INPUT_CLOSE_TAG = "[/USER_INPUT]";

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+|any\s+|the\s+)?(previous|prior|above|earlier|given|following|your)\s+(instructions?|prompts?|directions?|rules?|messages?|context)/i,
  /(abaikan|lupakan|kesampingkan|langgar)\s+(semua\s+|semua\s+instruksi|instruksi|perintah|rules|aturan)/i,
  /(disregard|forget|overlook)\s+(all\s+|the\s+)?(previous|prior|above|your)\s+(instructions?|rules?|system|context)/i,
  /system\s+(prompt|message|instructions?|rules?|secret)/i,
  /(prompt|instruksi)\s+sistem/i,
  /bocorkan\s+(prompt|instruksi|system|rahasia|api\s*key)/i,
  /reveal\s+(your|the)\s+(system\s+)?(prompt|instructions?|secrets?|api\s*key|source\s*code)/i,
  /show\s+me\s+(your|the)\s+(system\s+)?(prompt|instructions?|source\s*code)/i,
  /do\s+not\s+follow\s+(your|the)\s+(instructions?|rules?|constraints?|system\s+prompt)/i,
  /jangan\s+ikuti\s+(instruksi|perintah|aturan|rules|system)/i,
  /you\s+are\s+now\s+(a\s+|an\s+)?(openai|chatgpt|claude|gpt|gemini|llama|dall[-\s]*e|bing\s+chat)/i,
  /kamu\s+sekarang\s+(adalah|berperan\s+sebagai)\s+(openai|chatgpt|claude|gpt|gemini|llama|dan\s+jailbroken)/i,
  /act\s+as\s+(a\s+|an\s+)?(developer|admin|system|root|unrestricted)/i,
  /jailbreak|jailbroken|dan\s+jailbroken/i,
  /\b(dev\s*mode|developer\s+mode|sudo|gpt-?4\s+unlimited|prompt\s*injection\s*(test|try)?)\b/i,
  /\bbase64|rot13|caesar\s+cipher|hex\s+encoded\b/i,
];

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizeUserMessage(raw: string): string {
  return raw.replace(CONTROL_CHARACTER_PATTERN, "").trim();
}

export type GuardResult =
  | { ok: true; sanitized: string }
  | { ok: false; reason: string };

export function guardUserMessage(raw: string): GuardResult {
  const sanitized = sanitizeUserMessage(raw);
  if (sanitized === "") {
    return { ok: false, reason: "Pesan kosong. Tulis pertanyaan Anda." };
  }
  if (sanitized.length > MAX_USER_MESSAGE_LENGTH) {
    return {
      ok: false,
      reason: `Pesan terlalu panjang (maksimal ${MAX_USER_MESSAGE_LENGTH} karakter).`,
    };
  }
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      return { ok: false, reason: "Permintaan tidak dapat diproses oleh asisten." };
    }
  }
  return { ok: true, sanitized };
}

export function wrapUserInput(sanitized: string): string {
  return `${USER_INPUT_OPEN_TAG}\n${sanitized}\n${USER_INPUT_CLOSE_TAG}`;
}
