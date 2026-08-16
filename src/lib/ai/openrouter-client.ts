import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";
import { getOpenRouterConfig } from "./config";

export function createEstimateModel(): LanguageModel {
  const { apiKey, model, appName, appUrl } = getOpenRouterConfig();
  const provider = createOpenRouter({
    apiKey,
    appName,
    appUrl,
    compatibility: "strict",
  });
  return provider(model);
}
