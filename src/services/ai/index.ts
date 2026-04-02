import { AIProvider } from "./types";
import { MockAIProvider } from "./mockProvider";

// Swap this to a real provider when ready
let provider: AIProvider = new MockAIProvider();

export function getAIProvider(): AIProvider {
  return provider;
}

export function setAIProvider(p: AIProvider) {
  provider = p;
}

export * from "./types";
