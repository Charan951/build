export type AIProvider = 'gemini' | 'groq' | 'openrouter';

export interface AIGenerateInput {
  instruction: string;
  projectName?: string;
  type?: string;
  currency?: string;
}

export interface AIGenerateResult {
  provider: AIProvider;
  contentHtml: string;
}

export interface AIRefineSectionInput {
  contentHtml: string;
  selectedHtml: string;
  instruction: string;
  projectName?: string;
  type?: string;
}

export interface AIRefineSectionResult {
  provider: AIProvider;
  refinedHtml: string;
}

const buildPrompt = ({ instruction, projectName, type, currency }: AIGenerateInput): string => {
  return `You are a senior proposal writer for Speshway Solutions, a website and app development agency.
Produce ONLY the inner section HTML for a project estimation document. Do NOT include <html>, <head>, <body>,
<style>, <title>, any header/footer markup, or a meta-info grid - those are rendered by the template separately.
Do not wrap the output in markdown code fences.

There is NO fixed template or required section list. Read the admin's instruction below and decide for
yourself which sections this specific document actually needs, in whatever order and count makes sense for
that instruction - do not default to a generic "Overview / Roles / Features / Plans / Payment / Terms" shape
unless the instruction actually calls for those things. A short instruction should produce a short, focused
document; a detailed instruction covering many topics should produce a document that covers all of them.
Invent whatever section titles fit the content (e.g. "Tech Stack", "Timeline", "Risks & Mitigations",
"Future Scope") - you are not limited to the examples below.

You have this CSS class toolkit available (already styled by the template) - use only the pieces that fit
what you're building, never all of them, and feel free to fall back to plain <p>/<ul>/<table> for anything
that doesn't match one of these shapes:

- <div class="section-bar">Section Title</div> - a section heading band. Number sections sequentially
  (1., 2., 3. ...) only if you use more than one; a single-topic document doesn't need a number at all.
- <div class="roles-grid"> of <div class="role-card"><h4>Role Name</h4><p>Description</p></div> - for
  distinct user roles/personas, only when the instruction actually involves multiple roles.
- <table class="feature-table"> with <th>#</th><th>Feature</th><th>Description</th> and matching rows -
  for an itemized feature/scope list.
- <div class="plans-grid"> of <div class="plan-card"> (optionally "plan-card recommended" with a
  <div class="badge">RECOMMENDED</div>) each containing <div class="plan-header"><div class="plan-name">...
  </div><div class="plan-price">...</div></div><div class="plan-body"><ul>...</ul></div> - only when the
  instruction asks for multiple pricing/investment options.
- <table class="comparison-table"> with a "Deliverable" column plus one column per option, ✔/— cells, and
  a bold <tr class="total-row"> - only alongside plans-grid, and only when there's more than one plan to
  compare.
- <ul> of milestones - for payment terms, when payment is relevant to the instruction.
- <ul> covering things like validity, timeline, exclusions, support window, or handover - for terms &
  conditions, when the instruction implies a formal quotation rather than a short internal note.
- <div class="info-box"> - a soft warning-tint callout, best for exclusions/out-of-scope items.
- <div class="highlight-box"> - a soft success-tint callout, best for support/guarantee/inclusion notes.

Project name: ${projectName || 'the client project'}
Proposal type: ${type || 'general'}
Currency: ${currency || 'Indian Rupees (INR)'}
Instruction from the admin: ${instruction}

Respond with ONLY the HTML content described above, shaped by the instruction above - nothing else.`;
};

const buildRefinePrompt = ({ contentHtml, selectedHtml, instruction, projectName, type }: AIRefineSectionInput): string => {
  return `You are a senior proposal writer for Speshway Solutions, a website and app development agency.
You are editing ONE selected fragment inside a larger proposal document. Rewrite ONLY that fragment
according to the admin's instruction, and respond with ONLY the replacement HTML for that fragment -
nothing else, no markdown code fences, no explanation.

Rules:
- Preserve the same outer CSS class vocabulary already used in the document so the fragment keeps
  rendering correctly: .section-bar, .roles-grid / .role-card, .feature-table, .plans-grid / .plan-card
  (with optional "plan-card recommended" and a "badge" div), .comparison-table, .info-box, .highlight-box,
  and plain <p>/<ul>/<li>.
- If the selected fragment is a partial element (e.g. only text inside a <td> or <p>), keep your
  replacement at the same structural level - do not introduce a section-bar or wrap it in a whole new
  section unless the original selection already contained one.
- If the selection spans one or more complete elements (e.g. a whole role-card, table row, or plan-card),
  return complete replacement element(s) of the same kind.
- Keep the tone, currency, and style consistent with the rest of the document shown below for context.

Project name: ${projectName || 'the client project'}
Proposal type: ${type || 'general'}

Full document HTML (for context only - do not repeat it, do not edit anything outside the selection):
---
${contentHtml}
---

Selected HTML fragment to rewrite:
---
${selectedHtml}
---

Admin's instruction: ${instruction}

Respond with ONLY the replacement HTML for the selected fragment, nothing else.`;
};

const stripCodeFence = (text: string): string => {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:html)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
};

const logFailure = (provider: AIProvider, error: unknown): void => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[aiContentService] ${provider} generation failed: ${message}`);
};

// Every provider call gets a hard deadline so a slow/hanging provider falls
// through to the next one quickly instead of leaving the admin staring at a
// spinner indefinitely (fetch has no default timeout of its own).
const PROVIDER_TIMEOUT_MS = 25000;

async function withTimeout<T>(fn: (signal: AbortSignal) => Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fn(controller.signal);
  } catch (err: any) {
    if (err?.name === 'AbortError') throw new Error(`Timed out after ${ms}ms`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function callGeminiOnce(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
  const response = await withTimeout(
    (signal) =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 8192 },
        }),
      }),
    PROVIDER_TIMEOUT_MS
  );

  if (!response.ok) {
    throw new Error(`Gemini API responded with status ${response.status}`);
  }

  const data: any = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned an empty response');
  return stripCodeFence(text);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Gemini's "high demand" 503 is a common transient blip that often clears on
// an immediate retry - worth one quick retry before giving up the preferred
// provider and falling through to Groq/OpenRouter.
async function callGemini(prompt: string): Promise<string> {
  try {
    return await callGeminiOnce(prompt);
  } catch (error) {
    if (error instanceof Error && /status 503/.test(error.message)) {
      await sleep(1200);
      return callGeminiOnce(prompt);
    }
    throw error;
  }
}

// Groq's LPU inference is dramatically faster than Gemini/OpenRouter for this
// workload (~2s vs 10s+ for the same full proposal prompt), so it goes first.
async function callGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const response = await withTimeout(
    (signal) =>
      fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        signal,
        body: JSON.stringify({
          // llama-3.1-8b-instant was retired from Groq's catalog (404s now) -
          // openai/gpt-oss-20b is Groq's current fast, low-cost equivalent.
          // This account's free tier caps at 8000 tokens/minute for this
          // model, and that ceiling covers prompt + completion together, so
          // max_tokens has to leave real headroom below it, not sit at 8192.
          model: 'openai/gpt-oss-20b',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.6,
          max_tokens: 4000,
        }),
      }),
    PROVIDER_TIMEOUT_MS
  );

  if (!response.ok) {
    throw new Error(`Groq API responded with status ${response.status}`);
  }

  const data: any = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq returned an empty response');
  return stripCodeFence(text);
}

async function callOpenRouter(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

  const response = await withTimeout(
    (signal) =>
      fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        signal,
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b:free',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.6,
          max_tokens: 8192,
        }),
      }),
    PROVIDER_TIMEOUT_MS
  );

  if (!response.ok) {
    throw new Error(`OpenRouter API responded with status ${response.status}`);
  }

  const data: any = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenRouter returned an empty response');
  return stripCodeFence(text);
}

// Gemini is the preferred provider; Groq and OpenRouter are fallbacks tried
// only if Gemini fails, in this priority order.
const PROVIDER_CHAIN: Array<{ name: AIProvider; call: (prompt: string) => Promise<string> }> = [
  { name: 'gemini', call: callGemini },
  { name: 'groq', call: callGroq },
  { name: 'openrouter', call: callOpenRouter },
];

async function runProviderChain(prompt: string): Promise<{ provider: AIProvider; text: string }> {
  let lastError: unknown = null;

  for (const provider of PROVIDER_CHAIN) {
    try {
      const text = await provider.call(prompt);
      return { provider: provider.name, text };
    } catch (error) {
      logFailure(provider.name, error);
      lastError = error;
    }
  }

  const message = lastError instanceof Error ? lastError.message : 'All AI providers failed';
  throw new Error(message);
}

export const AIContentService = {
  async generateProposalContent(input: AIGenerateInput): Promise<AIGenerateResult> {
    try {
      const { provider, text } = await runProviderChain(buildPrompt(input));
      return { provider, contentHtml: text };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'All AI providers failed';
      throw new Error(`Unable to generate proposal content. ${message}`);
    }
  },

  async refineProposalSection(input: AIRefineSectionInput): Promise<AIRefineSectionResult> {
    try {
      const { provider, text } = await runProviderChain(buildRefinePrompt(input));
      return { provider, refinedHtml: text };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'All AI providers failed';
      throw new Error(`Unable to refine the selected content. ${message}`);
    }
  },
};
