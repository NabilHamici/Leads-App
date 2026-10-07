const express = require('express');
const config = require('../config');
const { addLead, getLead } = require('../services/leads');
const { fetchLead, placeholderLead } = require('../services/meta');

const router = express.Router();


router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.meta.verifyToken) {
    console.log('[webhook] verification OK');
    return res.status(200).send(challenge);
  }

  console.warn('[webhook] verification FAILED — bad mode or token');
  return res.sendStatus(403);
});


const extractLeadgenIds = (body = []) => {
  const ids = [];

  for (const entry of Array.isArray(body.entry) ? body.entry : []) {
    for (const change of Array.isArray(entry.changes) ? entry.changes : []) {
      if (change.field === 'leadgen' && change.value?.leadgen_id) {
        ids.push(change.value.leadgen_id);
      }
    }
  }

  return ids;
};

const handleLead = async (leadgenId) => {
  try {
    if (getLead(leadgenId)) {
      console.log(`[webhook] duplicate ${leadgenId} — already stored, skipping Graph call`);
      return;
    }

    const lead = await fetchLead(leadgenId);
    addLead(lead);
    console.log(`[webhook] new lead ${lead.id} (${lead.name})`);
  } catch (err) {
    console.error(`[webhook] ${err.message}`);
    addLead(placeholderLead(leadgenId, err.message));
  }
};


router.post('/webhook', (req, res) => {
  const ids = extractLeadgenIds(req.body);


  res.sendStatus(200);

  for (const id of ids) {
    void handleLead(id).catch((err) => console.error(`[webhook] unexpected: ${err.message}`));
  }

  if (ids.length === 0) {
    console.log('[webhook] 200 OK — payload had no leadgen changes');
  }
});

module.exports = router;