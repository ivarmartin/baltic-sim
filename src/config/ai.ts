/** AI configuration for OpenRouter API (proxied via Cloudflare Worker). */
export const aiConfig = {
  /**
   * API endpoint — points to the Cloudflare Worker proxy in production,
   * or directly to OpenRouter for local dev with a personal key.
   */
  endpoint: import.meta.env.VITE_AI_ENDPOINT as string
    || 'https://baltic-sim-api.ivarhub-1.workers.dev',
  /**
   * API key — only needed for local development (the Worker injects its own
   * key in production). Set via VITE_OPENROUTER_API_KEY in .env.
   */
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY as string || '',
  /** Model identifier */
  model: 'openai/gpt-4o-mini',
  /** Max tokens per response */
  maxTokens: 400,
  /** Sampling temperature */
  temperature: 0.7,
};
