/**
 * Cloudflare Worker — thin proxy for OpenRouter API.
 *
 * Keeps the API key server-side and adds basic per-IP rate limiting.
 */

interface Env {
  OPENROUTER_API_KEY: string;
  /** Optional: comma-separated allowed origins for CORS (default: '*') */
  ALLOWED_ORIGINS?: string;
  /** Optional: max requests per IP per minute (default: 20) */
  RATE_LIMIT?: string;
}

// Simple in-memory rate limiter (resets when the worker is evicted)
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string, limit: number): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > limit;
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestOrigin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGINS
      ? env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : null;
    // Allow if no allowlist configured, or if the request origin is in the list
    const corsOrigin = !allowed ? '*' : allowed.includes(requestOrigin) ? requestOrigin : allowed[0];
    const cors = corsHeaders(corsOrigin);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: cors });
    }

    // Rate limiting
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const limit = parseInt(env.RATE_LIMIT || '20', 10);
    if (isRateLimited(ip, limit)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again in a minute.' }), {
        status: 429,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Forward to OpenRouter
    const body = await request.text();
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      },
      body,
    });

    // Stream the response back
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...cors,
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
      },
    });
  },
};
