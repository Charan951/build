import crypto from 'crypto';
import MetaIntegration from '../models/MetaIntegration';

const GRAPH_API_VERSION = process.env.FB_GRAPH_API_VERSION || 'v19.0';

/**
 * Verify the X-Hub-Signature-256 header Meta attaches to every webhook POST,
 * so we only trust payloads that were actually signed with our App Secret.
 */
export const verifySignature = (rawBody: Buffer | undefined, signatureHeader: string | undefined): boolean => {
  if (!rawBody || !signatureHeader) return false;
  const appSecret = process.env.FB_APP_SECRET;
  if (!appSecret) return false;

  const expected =
    'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');

  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(signatureHeader);
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
};

/**
 * Page Access Token: prefer the one connected via the admin UI (MetaIntegration),
 * fall back to the env var for a zero-DB-setup MVP path.
 */
export const getPageAccessToken = async (): Promise<string | null> => {
  const integration = await MetaIntegration.findOne().sort({ createdAt: -1 });
  if (integration?.pageAccessToken) return integration.pageAccessToken;
  return process.env.FB_PAGE_ACCESS_TOKEN || null;
};

interface MetaFieldDatum {
  name: string;
  values: string[];
}

interface MetaLeadData {
  id: string;
  created_time?: string;
  ad_id?: string;
  form_id?: string;
  field_data: MetaFieldDatum[];
}

/**
 * Fetch the full lead payload from the Graph API using the leadgen_id
 * Meta hands us in the webhook event (the webhook itself carries no PII).
 */
export const fetchLeadData = async (leadgenId: string): Promise<MetaLeadData> => {
  const accessToken = await getPageAccessToken();
  if (!accessToken) {
    throw new Error('No Meta Page Access Token configured (MetaIntegration or FB_PAGE_ACCESS_TOKEN).');
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${leadgenId}?access_token=${encodeURIComponent(accessToken)}`;
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Meta Graph API request failed (${response.status}): ${body}`);
  }
  return (await response.json()) as MetaLeadData;
};

/**
 * Meta's field names vary by form (full_name vs first_name/last_name, etc.),
 * so map tolerantly instead of assuming a fixed schema.
 */
export const mapLeadFieldsToLeadSchema = (leadData: MetaLeadData) => {
  const values: Record<string, string> = {};
  for (const field of leadData.field_data || []) {
    values[field.name.toLowerCase()] = field.values?.[0] || '';
  }

  const firstName = values['first_name'] || '';
  const lastName = values['last_name'] || '';
  const name = values['full_name'] || [firstName, lastName].filter(Boolean).join(' ') || 'Facebook Lead';

  return {
    name,
    email: values['email'] || '',
    phone: values['phone_number'] || values['phone'] || '',
    company: values['company_name'] || values['company'] || '',
    message: values['message'] || values['comments'] || '',
    metaLeadId: leadData.id,
    metaFormId: leadData.form_id,
    metaAdId: leadData.ad_id,
    source: 'Facebook Lead Ads',
  };
};
