const config = require('../config');

const GRAPH_BASE = `https://graph.facebook.com/${config.meta.graphApiVersion}`;
const TIMEOUT_MS = 8000;


const flattenFields = (fieldData = []) =>
  fieldData.reduce((acc, { name, values }) => {
    if (name) acc[name] = Array.isArray(values) ? values.join(', ') : values;
    return acc;
  }, {});

const pickName = (f) =>
  f.full_name ||
  f.name ||
  [f.first_name, f.last_name].filter(Boolean).join(' ') ||
  'Unknown';

const pickEmail = (f) => f.email || f.work_email || f.contact_email || '';
const pickPhone = (f) => f.phone_number || f.phone || f.mobile || '';

const fetchLead = async (leadgenId) => {
  if (!config.meta.pageAccessToken) {
    throw new Error(`[meta] PAGE_ACCESS_TOKEN missing — cannot fetch ${leadgenId}`);
  }

  const url = new URL(`${GRAPH_BASE}/${leadgenId}`);
  url.searchParams.set('access_token', config.meta.pageAccessToken);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(url, { signal: controller.signal });
  } catch (err) {
    throw new Error(`[meta] Graph API unreachable for ${leadgenId}: ${err.message}`);
  } finally {
    clearTimeout(timer);
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = body?.error?.message || 'unknown error';
    throw new Error(`[meta] Graph API ${res.status} for ${leadgenId}: ${msg}`);
  }

  const fields = flattenFields(body.field_data);

  return {
    id: leadgenId,
    name: pickName(fields),
    email: pickEmail(fields),
    phone: pickPhone(fields),
    createdAt: Date.parse(body.created_time) || Date.now(),
    formId: body.form_id || null,
    adId: body.ad_id || null,
    incomplete: false,
  };
};

const placeholderLead = (leadgenId, reason) => ({
  id: leadgenId,
  name: `Lead ${leadgenId}`,
  email: '',
  phone: '',
  createdAt: Date.now(),
  formId: null,
  adId: null,
  incomplete: true,
  error: reason,
});

module.exports = { fetchLead, placeholderLead, flattenFields, pickName };