/** AI configuration for OpenRouter API. */
export const aiConfig = {
  /** OpenRouter chat completions endpoint */
  endpoint: 'https://openrouter.ai/api/v1/chat/completions',
  /** API key — set at runtime via aiConfig.apiKey = '...' */
  apiKey: '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',
  /** Model identifier */
  model: 'google/gemini-2.0-flash-001',
  /** Max tokens per response */
  maxTokens: 400,
  /** Sampling temperature */
  temperature: 0.7,
};
