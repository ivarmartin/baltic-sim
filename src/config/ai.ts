/** AI configuration for OpenRouter API. */
export const aiConfig = {
  /** OpenRouter chat completions endpoint */
  endpoint: 'https://openrouter.ai/api/v1/chat/completions',
  /** API key — set at runtime via aiConfig.apiKey = '...' */
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY as string || '',
  /** Model identifier */
  model: 'anthropic/claude-3.5-haiku',
  /** Max tokens per response */
  maxTokens: 400,
  /** Sampling temperature */
  temperature: 0.7,
};
