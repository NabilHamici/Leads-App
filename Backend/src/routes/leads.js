const express = require('express');
const { listLeads, count } = require('../services/leads');

const router = express.Router();


router.get('/api/leads', (req, res) => {
  const leads = listLeads();

  res.json({
    count: leads.length,
    total: count(),
    leads,
  });
});

module.exports = router;