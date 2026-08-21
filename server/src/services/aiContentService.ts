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

Use EXACTLY these CSS classes (already defined by the template) so the content renders correctly:

1. <div class="section-bar">1. Project Overview</div> followed by a <p> paragraph summarizing the project.

2. <div class="section-bar">2. User Roles</div> followed by <div class="roles-grid"> containing 3 or more
   <div class="role-card"><h4>Role Name</h4><p>Short description</p></div> blocks.

3. <div class="section-bar">3. Complete Feature List — Included in Scope</div> followed by
   <table class="feature-table"> with a header row (<th>#</th><th>Feature</th><th>Description</th>) and
   one <tr><td>#</td><td><strong>Feature</strong></td><td>Description</td></tr> row per feature (aim for
   a thorough list covering all major modules).

4. <div class="section-bar">4. Investment Plans</div> followed by an intro <p>, then
   <div class="plans-grid"> containing 2 <div class="plan-card"> blocks (one may additionally have class
   "plan-card recommended" and include <div class="badge">RECOMMENDED</div>), each with:
   <div class="plan-header"><div class="plan-name">Plan Name</div><div class="plan-price">Price</div></div>
   <div class="plan-body"><ul><li>Inclusion...</li></ul></div>

5. <div class="section-bar">5. Plan Comparison</div> followed by <table class="comparison-table"> with a
   "Deliverable" column plus one column per plan, using checkmarks (✔) or dashes (—) per cell, and a final
   bold row (<tr class="total-row"><td>Total Investment</td>...) showing the total price per plan.
   Omit this section if the proposal has only a single plan.

6. <div class="section-bar">6. Payment Terms</div> followed by a <ul> of payment milestones
   (e.g. advance, on UAT, on final delivery).

7. <div class="section-bar">7. Terms &amp; Conditions</div> followed by a <ul> covering validity period,
   timeline estimate, exclusions, support window, change-of-scope clause, and source-code handover.

Two additional callout classes are available and should be used where they fit naturally (e.g. an
"What's Excluded" section, or a "Post-Launch Support" note) instead of a plain paragraph:
- <div class="info-box"> — a soft warning-tint callout, best for exclusions/out-of-scope items.
- <div class="highlight-box"> — a soft success-tint callout, best for support/guarantee/inclusion notes.
Both accept a <p> or <ul> inside them directly.

Section numbers, titles, and count may flex based on the admin instruction (e.g. skip section 5 for a
single-plan proposal, or add a section) but the overall shape and CSS classes above must be preserved.

Project name: ${projectName || 'the client project'}
Proposal type: ${type || 'general'}
Currency: ${currency || 'Indian Rupees (INR)'}
Instruction from the admin: ${instruction}

Respond with ONLY the HTML section content described above, nothing else.`;
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

async function callGemini(prompt: string): Promise<string> {
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
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.6,
          max_tokens: 8192,
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
