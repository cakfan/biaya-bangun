"use client";

import { useRef, useState } from "react";
import { Eraser, LoaderCircle, Send, Sparkles, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { BuildingCostEstimate } from "@/lib/calculation/types";
import type { EstimateSummary } from "@/components/estimate-result";
import type { AiChatMessage } from "@/lib/ai/chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const QUICK_QUESTION = "Ringkas hasil estimasi ini dan beri 3 tips optimasi biaya.";

export function AiAssistantPanel({
  estimate,
  summary,
}: {
  estimate: BuildingCostEstimate;
  summary: EstimateSummary;
}) {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  function handleStop() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }

  function handleReset() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setMessages([]);
    setError(null);
    setIsStreaming(false);
  }

  async function handleSend(rawText?: string) {
    const text = (rawText ?? input).trim();
    if (text === "" || isStreaming) {
      return;
    }

    const userMessage: AiChatMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setError(null);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estimate, summary, messages: nextMessages }),
        signal: controller.signal,
      });

      if (!response.ok || response.body === null) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? `Gagal menghubungi asisten (status ${response.status}).`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        accumulated += decoder.decode(value, { stream: true });
        setMessages((current) => {
          const next = [...current];
          next[next.length - 1] = { role: "assistant", content: accumulated };
          return next;
        });
      }
      if (accumulated === "") {
        setMessages((current) => current.slice(0, -1));
        setError("Asisten tidak menghasilkan jawaban. Coba lagi.");
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        return;
      }
      setMessages((current) => current.slice(0, -1));
      setError(
        caught instanceof Error ? caught.message : "Terjadi kesalahan saat menjawab. Coba lagi.",
      );
    } finally {
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }

  const hasConversation = messages.length > 0;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
        <div className="flex flex-col gap-1.5">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="size-4 text-primary" />
            Tanya AI
          </CardTitle>
          <CardDescription className="text-sm">
            Bertanya tentang hasil estimasi ini, atau minta ringkasan &amp; tips optimasi.
          </CardDescription>
        </div>
        {hasConversation && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-1.5 text-xs cursor-pointer shrink-0"
          >
            <Eraser className="size-3.5" />
            Bersihkan
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!hasConversation && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSend(QUICK_QUESTION)}
            className="w-fit gap-1.5 cursor-pointer"
          >
            <Sparkles className="size-3.5" />
            Ringkasan &amp; 3 tips optimasi
          </Button>
        )}

        {hasConversation && (
          <ul className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
            {messages.map((message, index) => (
              <li
                key={index}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border/60 bg-muted/40",
                  )}
                >
                  {message.role === "user" ? (
                    message.content
                  ) : message.content === "" ? (
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <LoaderCircle className="size-3.5 animate-spin" />
                      Menjawab…
                    </span>
                  ) : (
                    <div className="ai-markdown">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {error !== null && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}

        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Contoh: bagian mana yang paling bisa dihemat?"
            disabled={isStreaming}
            className="h-10"
            aria-label="Pertanyaan untuk asisten AI"
          />
          {isStreaming ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleStop}
              className="cursor-pointer"
              aria-label="Hentikan jawaban"
            >
              <Square className="size-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={input.trim() === ""}
              className="cursor-pointer"
              aria-label="Kirim pertanyaan"
            >
              <Send className="size-4" />
            </Button>
          )}
        </form>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Jawaban dihasilkan AI dan hanya merujuk angka dari kalkulator AHSP. Perhitungan final
          tetap bersumber dari mesin estimasi, bukan AI.
        </p>
      </CardContent>
    </Card>
  );
}
