import { AIProvider } from "./types";
import { LiveAIProvider } from "./liveProvider";

const provider: AIProvider = new LiveAIProvider();

export function getAIProvider(): AIProvider {
  return provider;
}

export * from "./types";
