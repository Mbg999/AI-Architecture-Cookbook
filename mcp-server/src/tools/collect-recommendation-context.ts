import { z } from 'zod';

// Canonical recommendation context schema. Some fields are required (summary, primaryGoals)
export const RecommendationContextSchema = z.object({
  projectName: z.string().optional(),
  summary: z.string().min(20).describe('Short summary describing the system and goals'),
  primaryGoals: z.array(z.string()).min(1).describe('Primary goals (e.g., scalability, low-latency, compliance)'),
  scale: z.enum(['prototype', 'team', 'enterprise']).default('enterprise'),
  traffic: z
    .object({
      peakRPS: z.number().optional(),
      mau: z.number().optional(),
    })
    .optional(),
  data: z
    .object({
      sensitivity: z
        .enum(['public', 'internal', 'sensitive', 'regulated'])
        .default('internal'),
      sizeGB: z.number().optional(),
      realTime: z.boolean().default(false),
    })
    .optional(),
  compliance: z.array(z.string()).optional(),
  auth: z
    .object({
      type: z.enum(['oauth', 'sso', 'apiKey', 'none', 'custom']).default('oauth'),
    })
    .optional(),
  integrations: z.array(z.string()).optional(),
  deployment: z.enum(['k8s', 'serverless', 'vm', 'edge', 'on-prem']).optional(),
  availability: z.string().optional(),
  budgetPerMonth: z.string().optional(),
  timelineWeeks: z.number().optional(),
  teamExpertise: z.array(z.string()).optional(),
});

// Input schema for the tool: accept partial inputs (we validate more strictly inside)
export const recommendationContextInputSchema = RecommendationContextSchema.partial();

// Validate a partial input object and return structured guidance
export function validateRecommendationContext(input: unknown) {
  // Try to parse the full required schema (this will fail if required fields missing)
  const parsed = RecommendationContextSchema.safeParse(input);

  const suggestions = {
    scale: ['prototype', 'team', 'enterprise'],
    data_sensitivity: ['public', 'internal', 'sensitive', 'regulated'],
    auth_types: ['oauth', 'sso', 'apiKey', 'none', 'custom'],
  } as Record<string, unknown>;

  if (parsed.success) {
    const normalizedContext: Record<string, unknown> = { ...(parsed.data as Record<string, unknown>) };
    if (!('scale' in normalizedContext)) normalizedContext.scale = 'enterprise';
    if (!('data' in normalizedContext)) normalizedContext.data = { sensitivity: 'internal', realTime: false };
    if (!('auth' in normalizedContext)) normalizedContext.auth = { type: 'oauth' };
    return {
      valid: true,
      missingFields: [] as string[],
      normalizedContext,
      nextQuestion: null,
      suggestions,
    };
  }

  // Aggregate missing/invalid fields from Zod issues
  const issues = parsed.error.issues || [];
  const missing = new Set<string>();
  for (const it of issues) {
    const path = Array.isArray(it.path) && it.path.length ? it.path.join('.') : null;
    if (path) missing.add(path);
    else {
      // Non-path error (e.g., not an object) - suggest core fields
      missing.add('summary');
      missing.add('primaryGoals');
    }
  }

  const missingFields = Array.from(missing);

  // Heuristic: pick highest priority next question
  let nextQuestion = 'Please provide a short project summary (20+ chars) and list the primary goals.';
  if (missingFields.includes('summary')) {
    nextQuestion = 'Please provide a concise summary (20+ characters) describing the system, constraints, and goals.';
  } else if (missingFields.includes('primaryGoals')) {
    nextQuestion = 'List the primary goals for the project (e.g., scalability, low-latency, multi-tenant, regulatory compliance). Provide as comma-separated list.';
  } else if (missingFields.length > 0) {
    nextQuestion = `Please provide or clarify: ${missingFields.join(', ')}`;
  }

  // Build a normalized context with sensible defaults where possible
  const normalizedContext: Record<string, unknown> = {};
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    Object.assign(normalizedContext, input as Record<string, unknown>);
  }
  if (!('scale' in normalizedContext)) normalizedContext.scale = 'enterprise';
  if (!('data' in normalizedContext)) normalizedContext.data = { sensitivity: 'internal', realTime: false };
  if (!('auth' in normalizedContext)) normalizedContext.auth = { type: 'oauth' };

  return {
    valid: false,
    missingFields,
    normalizedContext,
    nextQuestion,
    suggestions,
  };
}

export default RecommendationContextSchema;
