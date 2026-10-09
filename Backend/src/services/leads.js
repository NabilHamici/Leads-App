const { EventEmitter } = require('events');

const leads = new Map();
const bus = new EventEmitter();

bus.setMaxListeners(20);

const addLead = (lead) => {
  if (leads.has(lead.id)) {
    return { lead: leads.get(lead.id), isNew: false };
  }

  leads.set(lead.id, lead);
  bus.emit('lead:new', lead);

  return { lead, isNew: true };
};

const deleteLead = (id) => {
  if (!leads.has(id)) {
    return false;
  }

  leads.delete(id);
  bus.emit('lead:deleted', { id });

  return true;
};

const clearLeads = () => {
  const removed = leads.size;
  leads.clear();

  if (removed > 0) {
    bus.emit('lead:cleared', { removed });
  }

  return removed;
};

const listLeads = () =>
  [...leads.values()].sort((a, b) => b.createdAt - a.createdAt);

const getLead = (id) => leads.get(id) || null;

const count = () => leads.size;

module.exports = {
  bus,
  addLead,
  deleteLead,
  clearLeads,
  listLeads,
  getLead,
  count,
};
