/* ── db.js — localStorage data layer ─────────────────────────── */
'use strict';

const DB = (() => {
  const PREFIX = 'aiw_';
  const KEYS = {
    clients:     PREFIX + 'clients',
    projects:    PREFIX + 'projects',
    changes:     PREFIX + 'changes',
    payments:    PREFIX + 'payments',
    expenses:    PREFIX + 'expenses',
    credentials: PREFIX + 'credentials',
    history:     PREFIX + 'history',
  };

  // ── Helpers ────────────────────────────────────────────────── //
  function load(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  }

  function save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function now() { return new Date().toISOString(); }

  // ── History ────────────────────────────────────────────────── //
  function addHistory(clientId, action, detail = '') {
    const list = load(KEYS.history);
    list.unshift({ id: uid(), clientId, action, detail, ts: now() });
    // keep last 200 entries per client
    const trimmed = list.filter(h => h.clientId === clientId).slice(0, 200);
    const others  = list.filter(h => h.clientId !== clientId);
    save(KEYS.history, [...trimmed, ...others]);
  }

  // ── Clients ────────────────────────────────────────────────── //
  const clients = {
    getAll() { return load(KEYS.clients); },

    get(id) { return load(KEYS.clients).find(c => c.id === id) || null; },

    create(data) {
      const list = load(KEYS.clients);
      const client = {
        id:            uid(),
        name:          data.name || '',
        company:       data.company || '',
        whatsapp:      data.whatsapp || '',
        email:         data.email || '',
        status:        data.status || 'activo',       // activo|pausado|terminado|baja
        startDate:     data.startDate || '',
        serviceType:   data.serviceType || '',
        webLink:       data.webLink || '',
        vercelLink:    data.vercelLink || '',
        githubLink:    data.githubLink || '',
        domain:        data.domain || '',
        domainProvider: data.domainProvider || '',
        notes:         data.notes || '',
        createdAt:     now(),
        updatedAt:     now(),
      };
      list.unshift(client);
      save(KEYS.clients, list);
      addHistory(client.id, 'Cliente creado', client.name);
      return client;
    },

    update(id, data) {
      const list = load(KEYS.clients);
      const idx  = list.findIndex(c => c.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...data, id, updatedAt: now() };
      save(KEYS.clients, list);
      addHistory(id, 'Cliente editado', data.name || list[idx].name);
      return list[idx];
    },

    delete(id) {
      const list = load(KEYS.clients).filter(c => c.id !== id);
      save(KEYS.clients, list);
      // cascade-delete related records
      [KEYS.projects, KEYS.changes, KEYS.payments, KEYS.expenses, KEYS.credentials]
        .forEach(k => save(k, load(k).filter(r => r.clientId !== id)));
      save(KEYS.history, load(KEYS.history).filter(h => h.clientId !== id));
    },
  };

  // ── Projects ───────────────────────────────────────────────── //
  const projects = {
    getByClient(clientId) {
      return load(KEYS.projects).find(p => p.clientId === clientId) || null;
    },

    upsert(clientId, data) {
      const list = load(KEYS.projects);
      const idx  = list.findIndex(p => p.clientId === clientId);
      const proj = {
        id:           idx >= 0 ? list[idx].id : uid(),
        clientId,
        projectName:  data.projectName || '',
        webType:      data.webType || '',
        stack:        data.stack || '',
        github:       data.github || '',
        deploy:       data.deploy || '',
        domain:       data.domain || '',
        deliveryDate: data.deliveryDate || '',
        status:       data.status || 'en_desarrollo', // en_desarrollo|publicado|mantenimiento|pausado
        notes:        data.notes || '',
        updatedAt:    now(),
      };
      if (idx >= 0) list[idx] = proj;
      else list.push(proj);
      save(KEYS.projects, list);
      addHistory(clientId, 'Proyecto actualizado', proj.projectName);
      return proj;
    },
  };

  // ── Changes ────────────────────────────────────────────────── //
  const changes = {
    getByClient(clientId) {
      return load(KEYS.changes).filter(c => c.clientId === clientId)
             .sort((a, b) => {
               // pending/in_process first, then by priority
               const stOrd = { pendiente: 0, en_proceso: 1, hecho: 2 };
               const prOrd = { alta: 0, media: 1, baja: 2 };
               const stDiff = (stOrd[a.status] ?? 3) - (stOrd[b.status] ?? 3);
               if (stDiff !== 0) return stDiff;
               return (prOrd[a.priority] ?? 3) - (prOrd[b.priority] ?? 3);
             });
    },

    create(clientId, data) {
      const list = load(KEYS.changes);
      const item = {
        id:          uid(),
        clientId,
        title:       data.title || '',
        description: data.description || '',
        requestedAt: data.requestedAt || now().slice(0, 10),
        priority:    data.priority || 'media',   // baja|media|alta
        status:      data.status || 'pendiente', // pendiente|en_proceso|hecho
        finishedAt:  data.finishedAt || '',
        notes:       data.notes || '',
        createdAt:   now(),
        updatedAt:   now(),
      };
      list.unshift(item);
      save(KEYS.changes, list);
      addHistory(clientId, 'Cambio agregado', item.title);
      return item;
    },

    update(id, data) {
      const list = load(KEYS.changes);
      const idx  = list.findIndex(c => c.id === id);
      if (idx === -1) return null;
      const wasDone = list[idx].status === 'hecho';
      list[idx] = { ...list[idx], ...data, id, updatedAt: now() };
      save(KEYS.changes, list);
      if (!wasDone && data.status === 'hecho') {
        addHistory(list[idx].clientId, 'Cambio marcado como hecho', list[idx].title);
      }
      return list[idx];
    },

    delete(id) {
      const list = load(KEYS.changes);
      const item = list.find(c => c.id === id);
      save(KEYS.changes, list.filter(c => c.id !== id));
      if (item) addHistory(item.clientId, 'Cambio eliminado', item.title);
    },
  };

  // ── Payments ───────────────────────────────────────────────── //
  const payments = {
    getByClient(clientId) {
      return load(KEYS.payments).filter(p => p.clientId === clientId)
             .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
    },

    create(clientId, data) {
      const list = load(KEYS.payments);
      const item = {
        id:          uid(),
        clientId,
        amount:      parseFloat(data.amount) || 0,
        paymentDate: data.paymentDate || now().slice(0, 10),
        method:      data.method || '',       // transferencia|efectivo|mercadopago|paypal|otro
        concept:     data.concept || '',
        status:      data.status || 'pagado', // pagado|pendiente|atrasado
        notes:       data.notes || '',
        createdAt:   now(),
      };
      list.unshift(item);
      save(KEYS.payments, list);
      addHistory(clientId, 'Pago cargado', `$${item.amount} — ${item.concept}`);
      return item;
    },

    update(id, data) {
      const list = load(KEYS.payments);
      const idx  = list.findIndex(p => p.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...data, id, amount: parseFloat(data.amount) || list[idx].amount };
      save(KEYS.payments, list);
      addHistory(list[idx].clientId, 'Pago editado', `$${list[idx].amount}`);
      return list[idx];
    },

    delete(id) {
      const list = load(KEYS.payments);
      const item = list.find(p => p.id === id);
      save(KEYS.payments, list.filter(p => p.id !== id));
      if (item) addHistory(item.clientId, 'Pago eliminado', `$${item.amount}`);
    },

    // Extra fields per client (base amounts, monthly amount)
    getMeta(clientId) {
      try { return JSON.parse(localStorage.getItem(PREFIX + 'pmeta_' + clientId) || '{}'); }
      catch { return {}; }
    },

    saveMeta(clientId, meta) {
      localStorage.setItem(PREFIX + 'pmeta_' + clientId, JSON.stringify(meta));
    },
  };

  // ── Expenses ───────────────────────────────────────────────── //
  const expenses = {
    getByClient(clientId) {
      return load(KEYS.expenses).filter(e => e.clientId === clientId)
             .sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    create(clientId, data) {
      const list = load(KEYS.expenses);
      const item = {
        id:        uid(),
        clientId,
        concept:   data.concept || '',
        amount:    parseFloat(data.amount) || 0,
        frequency: data.frequency || 'unico',  // unico|mensual|anual
        date:      data.date || now().slice(0, 10),
        provider:  data.provider || '',
        notes:     data.notes || '',
        createdAt: now(),
      };
      list.unshift(item);
      save(KEYS.expenses, list);
      addHistory(clientId, 'Gasto cargado', `${item.concept} $${item.amount}`);
      return item;
    },

    update(id, data) {
      const list = load(KEYS.expenses);
      const idx  = list.findIndex(e => e.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...data, id, amount: parseFloat(data.amount) || list[idx].amount };
      save(KEYS.expenses, list);
      return list[idx];
    },

    delete(id) {
      const list = load(KEYS.expenses);
      const item = list.find(e => e.id === id);
      save(KEYS.expenses, list.filter(e => e.id !== id));
      if (item) addHistory(item.clientId, 'Gasto eliminado', item.concept);
    },
  };

  // ── Credentials ────────────────────────────────────────────── //
  // Passwords are Base64 encoded — personal tool only
  const credentials = {
    getByClient(clientId) {
      return load(KEYS.credentials).filter(c => c.clientId === clientId);
    },

    create(clientId, data) {
      const list = load(KEYS.credentials);
      const item = {
        id:       uid(),
        clientId,
        platform: data.platform || '',
        link:     data.link || '',
        user:     data.user || '',
        password: data.password ? btoa(data.password) : '',
        note:     data.note || '',
        createdAt: now(),
        updatedAt: now(),
      };
      list.push(item);
      save(KEYS.credentials, list);
      addHistory(clientId, 'Credencial agregada', item.platform);
      return item;
    },

    update(id, data) {
      const list = load(KEYS.credentials);
      const idx  = list.findIndex(c => c.id === id);
      if (idx === -1) return null;
      list[idx] = {
        ...list[idx], ...data, id,
        password: data.password ? btoa(data.password) : list[idx].password,
        updatedAt: now(),
      };
      save(KEYS.credentials, list);
      return list[idx];
    },

    decode(encoded) {
      if (!encoded) return '';
      try { return atob(encoded); }
      catch { return '(error)'; }
    },

    delete(id) {
      const list = load(KEYS.credentials);
      const item = list.find(c => c.id === id);
      save(KEYS.credentials, list.filter(c => c.id !== id));
      if (item) addHistory(item.clientId, 'Credencial eliminada', item.platform);
    },
  };

  // ── History ────────────────────────────────────────────────── //
  const history = {
    getByClient(clientId) {
      return load(KEYS.history)
             .filter(h => h.clientId === clientId)
             .sort((a, b) => new Date(b.ts) - new Date(a.ts))
             .slice(0, 100);
    },
  };

  // ── Dashboard Stats ────────────────────────────────────────── //
  function getDashboardStats() {
    const allClients  = clients.getAll();
    const allChanges  = load(KEYS.changes);
    const allPayments = load(KEYS.payments);

    const monthStr = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    const activeClients = allClients.filter(c => c.status === 'activo').length;
    const devProjects   = load(KEYS.projects).filter(p => p.status === 'en_desarrollo').length;

    const pendingChanges = allChanges.filter(c => c.status === 'pendiente').length;
    const doneChanges    = allChanges.filter(c => c.status === 'hecho').length;

    const monthPayments = allPayments.filter(p => p.paymentDate?.startsWith(monthStr));
    const pendingPay    = monthPayments.filter(p => p.status === 'pendiente').reduce((s, p) => s + p.amount, 0);
    const collectedPay  = monthPayments.filter(p => p.status === 'pagado').reduce((s, p) => s + p.amount, 0);

    const allExpenses    = load(KEYS.expenses);
    const monthlyExp = allExpenses.filter(e => e.frequency === 'mensual').reduce((s, e) => s + e.amount, 0);
    const monthExp   = allExpenses.filter(e => e.date?.startsWith(monthStr) && e.frequency === 'unico')
                                  .reduce((s, e) => s + e.amount, 0);
    const totalMonthlyExp = monthlyExp + monthExp;

    const estimatedProfit = collectedPay - totalMonthlyExp;

    // Clients with overdue payments
    const lateClients = allClients.filter(c => {
      const pays = allPayments.filter(p => p.clientId === c.id && p.status === 'atrasado');
      return pays.length > 0;
    });

    return {
      activeClients,
      devProjects,
      pendingChanges,
      doneChanges,
      pendingPay,
      collectedPay,
      totalMonthlyExp,
      estimatedProfit,
      lateClients,
    };
  }

  return {
    clients,
    projects,
    changes,
    payments,
    expenses,
    credentials,
    history,
    getDashboardStats,
  };
})();
