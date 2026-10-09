const express = require('express');
const {
  listLeads,
  count,
  deleteLead,
  clearLeads,
} = require('../services/leads');

const router = express.Router();

router.get('/api/leads', (req, res) => {
  const leads = listLeads();

  res.json({
    count: leads.length,
    total: count(),
    leads,
  });
});

router.delete('/api/leads/:id', (req, res) => {
  const { id } = req.params;

  if (!deleteLead(id)) {
    return res.status(404).json({ error: 'Lead not found', id });
  }

  console.log(`[leads] deleted ${id}`);
  res.json({ deleted: true, id });
});

router.delete('/api/leads', (req, res) => {
  const removed = clearLeads();

  console.log(`[leads] cleared ${removed} lead(s)`);
  res.json({ cleared: removed });
});

module.exports = router;
