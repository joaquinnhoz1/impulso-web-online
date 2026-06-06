/* ── app.js — Admin SPA ───────────────────────────────────────── */
'use strict';

// ── Auth guard ─────────────────────────────────────────────────── //
(function () {
  const sess = sessionStorage.getItem('aiw_session');
  if (!sess) { window.location.href = 'login.html'; throw new Error('unauth'); }
})();

// ── State ──────────────────────────────────────────────────────── //
const state = {
  view: 'dashboard',     // dashboard | clients | client
  clientId: null,
  tab: 'general',        // active tab in client detail
  clientFilter: { q: '', status: 'all' },
};

// ── Icons (inline SVG snippets) ────────────────────────────────── //
const ic = {
  users:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  home:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  edit:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  plus:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  check:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  arrow:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>`,
  search:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  globe:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  link:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  github:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
  dollar:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  trending: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  clock:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  key:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  list:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  info:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  logout:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  eye:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  warning:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  copy:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
};

// ── Utilities ──────────────────────────────────────────────────── //
const fmt = {
  money: v => '$' + Number(v || 0).toLocaleString('es-AR'),
  date:  v => v ? new Date(v + 'T00:00:00').toLocaleDateString('es-AR') : '—',
  ts:    v => v ? new Date(v).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : '—',
  initials: name => name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?',
};

function statusBadge(s) {
  const map = {
    activo:       ['badge-green',  'Activo'],
    pausado:      ['badge-yellow', 'Pausado'],
    terminado:    ['badge-blue',   'Terminado'],
    baja:         ['badge-gray',   'Baja'],
    en_desarrollo:['badge-blue',   'En desarrollo'],
    publicado:    ['badge-green',  'Publicado'],
    mantenimiento:['badge-cyan',   'Mantenimiento'],
    pendiente:    ['badge-yellow', 'Pendiente'],
    en_proceso:   ['badge-blue',   'En proceso'],
    hecho:        ['badge-green',  'Hecho'],
    pagado:       ['badge-green',  'Pagado'],
    atrasado:     ['badge-red',    'Atrasado'],
    alta:         ['badge-red',    'Alta'],
    media:        ['badge-yellow', 'Media'],
    baja_pr:      ['badge-gray',   'Baja'],
  };
  const [cls, label] = map[s] || ['badge-gray', s || '—'];
  return `<span class="badge ${cls}">${label}</span>`;
}

function priorityBadge(p) {
  const map = { alta: ['badge-red','Alta'], media: ['badge-yellow','Media'], baja: ['badge-gray','Baja'] };
  const [cls, label] = map[p] || ['badge-gray', p];
  return `<span class="badge ${cls}">${label}</span>`;
}

// ── Toast ──────────────────────────────────────────────────────── //
function toast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ── Modal helpers ──────────────────────────────────────────────── //
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); el.querySelector('input,textarea,select')?.focus(); }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
}

// ── Confirm dialog ─────────────────────────────────────────────── //
function confirm(msg, onYes) {
  document.getElementById('confirm-msg').textContent = msg;
  document.getElementById('confirm-yes').onclick = () => { closeModal('confirm-modal'); onYes(); };
  openModal('confirm-modal');
}

// ── Router ─────────────────────────────────────────────────────── //
function navigate(view, clientId, tab) {
  state.view = view;
  if (clientId !== undefined) state.clientId = clientId;
  if (tab !== undefined) state.tab = tab;
  renderApp();
}

// ── Render App Shell ───────────────────────────────────────────── //
function renderApp() {
  const main = document.getElementById('main-content');
  updateNav();

  if (state.view === 'dashboard') {
    document.getElementById('topbar-title').textContent = 'Dashboard';
    main.innerHTML = renderDashboard();
  } else if (state.view === 'clients') {
    document.getElementById('topbar-title').textContent = 'Clientes';
    main.innerHTML = renderClients();
    bindClientsEvents();
  } else if (state.view === 'client') {
    const client = DB.clients.get(state.clientId);
    document.getElementById('topbar-title').textContent = client ? client.name : 'Cliente';
    main.innerHTML = renderClientDetail(client);
    bindClientDetailEvents(client);
  }
}

function updateNav() {
  document.querySelectorAll('.nav-item[data-view]').forEach(el => {
    el.classList.toggle('active', el.dataset.view === state.view);
  });
}

// ══════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════
function renderDashboard() {
  const s = DB.getDashboardStats();
  const late = s.lateClients;

  return `
  <div class="stats-grid">
    ${statCard('blue', ic.users, 'Clientes activos', s.activeClients, '')}
    ${statCard('purple', ic.trending, 'Trabajos en desarrollo', s.devProjects, '')}
    ${statCard('yellow', ic.clock, 'Cambios pendientes', s.pendingChanges, '')}
    ${statCard('green', ic.check, 'Cambios realizados', s.doneChanges, '')}
    ${statCard('red', ic.warning, 'Pagos pendientes (mes)', fmt.money(s.pendingPay), '')}
    ${statCard('green', ic.dollar, 'Cobrado este mes', fmt.money(s.collectedPay), '')}
    ${statCard('cyan', ic.list, 'Gastos mensuales', fmt.money(s.totalMonthlyExp), '')}
    ${statCard('purple', ic.trending, 'Ganancia estimada', fmt.money(s.estimatedProfit), s.estimatedProfit >= 0 ? '' : 'Revisar gastos')}
  </div>

  ${late.length > 0 ? `
  <div class="card mb-2">
    <div class="card-header">
      <div>
        <div class="card-title" style="color:var(--danger)">${ic.warning} Clientes con pagos atrasados</div>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Cliente</th><th>Empresa</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          ${late.map(c => `
            <tr onclick="navigate('client','${c.id}','payments')">
              <td><strong>${c.name}</strong></td>
              <td class="td-muted">${c.company || '—'}</td>
              <td>${statusBadge(c.status)}</td>
              <td><span class="badge badge-red">Pago atrasado</span></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>` : ''}

  <div class="card">
    <div class="card-header">
      <div class="card-title">Actividad reciente</div>
      <button class="btn btn-outline btn-sm" onclick="navigate('clients')">Ver todos los clientes</button>
    </div>
    ${renderRecentActivity()}
  </div>`;
}

function statCard(color, icon, label, value, sub) {
  return `
  <div class="stat-card">
    <div class="stat-icon ${color}">${icon}</div>
    <div class="stat-label">${label}</div>
    <div class="stat-value">${value}</div>
    ${sub ? `<div class="stat-sub">${sub}</div>` : ''}
  </div>`;
}

function renderRecentActivity() {
  // Show last 10 history events across all clients
  try {
    const all = JSON.parse(localStorage.getItem('aiw_history') || '[]')
                .sort((a, b) => new Date(b.ts) - new Date(a.ts))
                .slice(0, 10);
    if (!all.length) return `<div class="empty-state"><div class="empty-icon">${ic.list}</div><div class="empty-title">Sin actividad aún</div></div>`;

    return `<div class="timeline">${all.map(h => {
      const client = DB.clients.get(h.clientId);
      return `<div class="timeline-item">
        <div class="timeline-dot" style="background:var(--accent-dim);color:var(--accent)">${ic.clock}</div>
        <div class="timeline-content">
          <div class="timeline-action">${h.action}${h.detail ? ` — <em>${h.detail}</em>` : ''}</div>
          <div class="timeline-time">${fmt.ts(h.ts)}${client ? ` · <a href="#" onclick="navigate('client','${client.id}');return false;" style="color:var(--accent)">${client.name}</a>` : ''}</div>
        </div>
      </div>`;
    }).join('')}</div>`;
  } catch { return ''; }
}

// ══════════════════════════════════════════════════════════════════
// CLIENTS LIST
// ══════════════════════════════════════════════════════════════════
function renderClients() {
  const all = DB.clients.getAll();
  const { q, status } = state.clientFilter;
  const filtered = all.filter(c => {
    const matchQ = !q || [c.name, c.company, c.email].some(v => v?.toLowerCase().includes(q.toLowerCase()));
    const matchS = status === 'all' || c.status === status;
    return matchQ && matchS;
  });

  return `
  <div class="toolbar">
    <div class="search-wrap">
      ${ic.search}
      <input class="search-input" id="client-search" placeholder="Buscar por nombre, empresa o email..." value="${q}" oninput="filterClients(this.value)" />
    </div>
    <select class="filter-select" onchange="filterClientStatus(this.value)">
      <option value="all" ${status==='all'?'selected':''}>Todos los estados</option>
      <option value="activo" ${status==='activo'?'selected':''}>Activos</option>
      <option value="pausado" ${status==='pausado'?'selected':''}>Pausados</option>
      <option value="terminado" ${status==='terminado'?'selected':''}>Terminados</option>
      <option value="baja" ${status==='baja'?'selected':''}>Baja</option>
    </select>
    <button class="btn btn-primary" onclick="openClientModal()">
      ${ic.plus} Nuevo cliente
    </button>
  </div>

  <div class="card">
    ${filtered.length === 0
      ? `<div class="empty-state">
          <div class="empty-icon">${ic.users}</div>
          <div class="empty-title">No hay clientes</div>
          <div class="empty-sub">Agregá tu primer cliente para empezar.</div>
          <button class="btn btn-primary mt-1" onclick="openClientModal()">${ic.plus} Agregar cliente</button>
        </div>`
      : `<div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Empresa</th>
                <th>Servicio</th>
                <th>Estado</th>
                <th>Inicio</th>
                <th>Web</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(c => `
                <tr onclick="navigate('client','${c.id}','general')">
                  <td>
                    <div class="flex-gap">
                      <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#4f8dff22,#7c3aed22);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:0.75rem;color:var(--accent);flex-shrink:0">
                        ${fmt.initials(c.name)}
                      </div>
                      <strong>${c.name}</strong>
                    </div>
                  </td>
                  <td class="td-muted">${c.company || '—'}</td>
                  <td class="td-muted">${c.serviceType || '—'}</td>
                  <td>${statusBadge(c.status)}</td>
                  <td class="td-muted">${fmt.date(c.startDate)}</td>
                  <td>${c.webLink ? `<a href="${c.webLink}" target="_blank" class="meta-link" onclick="event.stopPropagation()">${ic.link} Ver</a>` : '<span class="td-muted">—</span>'}</td>
                  <td onclick="event.stopPropagation()">
                    <div class="flex-gap">
                      <button class="btn btn-ghost btn-sm" onclick="openClientModal('${c.id}')" title="Editar">${ic.edit}</button>
                      <button class="btn btn-ghost btn-sm" onclick="deleteClient('${c.id}')" title="Eliminar" style="color:var(--danger)">${ic.trash}</button>
                    </div>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`}
  </div>

  <!-- Client Modal -->
  ${renderClientModal()}`;
}

function filterClients(q) {
  state.clientFilter.q = q;
  const main = document.getElementById('main-content');
  main.innerHTML = renderClients();
  bindClientsEvents();
  document.getElementById('client-search').focus();
}

function filterClientStatus(s) {
  state.clientFilter.status = s;
  const main = document.getElementById('main-content');
  main.innerHTML = renderClients();
  bindClientsEvents();
}

function bindClientsEvents() {
  document.getElementById('client-modal-form')?.addEventListener('submit', submitClientModal);
}

function renderClientModal(id) {
  const c = id ? DB.clients.get(id) : null;
  return `
  <div class="modal-overlay" id="client-modal">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">${c ? 'Editar cliente' : 'Nuevo cliente'}</span>
        <button class="modal-close" onclick="closeModal('client-modal')">${ic.plus}<style>.modal-close svg{transform:rotate(45deg)}</style></button>
      </div>
      <form class="modal-body" id="client-modal-form" onsubmit="return false">
        <input type="hidden" id="cm-id" value="${id || ''}" />
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Nombre *</label>
            <input type="text" id="cm-name" value="${c?.name||''}" placeholder="Juan Pérez" required />
          </div>
          <div class="form-group">
            <label class="form-label">Empresa / Emprendimiento</label>
            <input type="text" id="cm-company" value="${c?.company||''}" placeholder="Mi Negocio" />
          </div>
          <div class="form-group">
            <label class="form-label">WhatsApp</label>
            <input type="tel" id="cm-whatsapp" value="${c?.whatsapp||''}" placeholder="+549..." />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="cm-email" value="${c?.email||''}" placeholder="mail@ejemplo.com" />
          </div>
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select id="cm-status">
              ${['activo','pausado','terminado','baja'].map(s => `<option value="${s}" ${c?.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Fecha de inicio</label>
            <input type="date" id="cm-startdate" value="${c?.startDate||''}" />
          </div>
          <div class="form-group">
            <label class="form-label">Tipo de servicio</label>
            <input type="text" id="cm-service" value="${c?.serviceType||''}" placeholder="Landing page, E-commerce..." />
          </div>
          <div class="form-group">
            <label class="form-label">Dominio</label>
            <input type="text" id="cm-domain" value="${c?.domain||''}" placeholder="midominio.com" />
          </div>
          <div class="form-group">
            <label class="form-label">Proveedor del dominio</label>
            <input type="text" id="cm-domainprovider" value="${c?.domainProvider||''}" placeholder="NIC, GoDaddy..." />
          </div>
          <div class="form-group">
            <label class="form-label">Link web</label>
            <input type="url" id="cm-weblink" value="${c?.webLink||''}" placeholder="https://..." />
          </div>
          <div class="form-group">
            <label class="form-label">Link Vercel</label>
            <input type="url" id="cm-vercel" value="${c?.vercelLink||''}" placeholder="https://..." />
          </div>
          <div class="form-group">
            <label class="form-label">Link GitHub</label>
            <input type="url" id="cm-github" value="${c?.githubLink||''}" placeholder="https://github.com/..." />
          </div>
          <div class="form-group form-full">
            <label class="form-label">Notas internas</label>
            <textarea id="cm-notes" placeholder="Observaciones, acuerdos especiales...">${c?.notes||''}</textarea>
          </div>
        </div>
      </form>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal('client-modal')">Cancelar</button>
        <button class="btn btn-primary" onclick="submitClientModal()">${ic.check} ${c ? 'Guardar' : 'Crear cliente'}</button>
      </div>
    </div>
  </div>`;
}

function openClientModal(id) {
  const main = document.getElementById('main-content');
  // Re-render modal with correct data
  const existing = document.getElementById('client-modal');
  if (existing) existing.remove();
  main.insertAdjacentHTML('beforeend', renderClientModal(id));
  document.getElementById('client-modal-form')?.addEventListener('submit', submitClientModal);
  openModal('client-modal');
}

function submitClientModal() {
  const id = document.getElementById('cm-id').value;
  const data = {
    name:           document.getElementById('cm-name').value.trim(),
    company:        document.getElementById('cm-company').value.trim(),
    whatsapp:       document.getElementById('cm-whatsapp').value.trim(),
    email:          document.getElementById('cm-email').value.trim(),
    status:         document.getElementById('cm-status').value,
    startDate:      document.getElementById('cm-startdate').value,
    serviceType:    document.getElementById('cm-service').value.trim(),
    domain:         document.getElementById('cm-domain').value.trim(),
    domainProvider: document.getElementById('cm-domainprovider').value.trim(),
    webLink:        document.getElementById('cm-weblink').value.trim(),
    vercelLink:     document.getElementById('cm-vercel').value.trim(),
    githubLink:     document.getElementById('cm-github').value.trim(),
    notes:          document.getElementById('cm-notes').value.trim(),
  };

  if (!data.name) { toast('El nombre es obligatorio', 'error'); return; }

  if (id) {
    DB.clients.update(id, data);
    toast('Cliente actualizado');
  } else {
    DB.clients.create(data);
    toast('Cliente creado');
  }

  closeModal('client-modal');
  renderApp();
}

function deleteClient(id) {
  const c = DB.clients.get(id);
  confirm(`¿Eliminar a ${c?.name}? Se eliminarán todos sus datos.`, () => {
    DB.clients.delete(id);
    toast('Cliente eliminado');
    state.view = 'clients';
    renderApp();
  });
}

// ══════════════════════════════════════════════════════════════════
// CLIENT DETAIL
// ══════════════════════════════════════════════════════════════════
function renderClientDetail(client) {
  if (!client) return `<button class="back-btn" onclick="navigate('clients')">${ic.arrow} Volver</button><p>Cliente no encontrado.</p>`;

  const tabs = [
    { id: 'general',     label: 'General',     icon: ic.info },
    { id: 'project',     label: 'Proyecto',    icon: ic.globe },
    { id: 'changes',     label: 'Cambios',     icon: ic.list },
    { id: 'payments',    label: 'Pagos',       icon: ic.dollar },
    { id: 'expenses',    label: 'Gastos',      icon: ic.trending },
    { id: 'credentials', label: 'Accesos',     icon: ic.key },
    { id: 'history',     label: 'Historial',   icon: ic.clock },
  ];

  const tabContent = {
    general:     renderTabGeneral(client),
    project:     renderTabProject(client),
    changes:     renderTabChanges(client),
    payments:    renderTabPayments(client),
    expenses:    renderTabExpenses(client),
    credentials: renderTabCredentials(client),
    history:     renderTabHistory(client),
  }[state.tab] || '';

  return `
  <button class="back-btn" onclick="navigate('clients')">${ic.arrow} Todos los clientes</button>

  <div class="client-header">
    <div class="client-avatar">${fmt.initials(client.name)}</div>
    <div class="client-info">
      <div class="client-name">${client.name}</div>
      <div class="client-company">${client.company || 'Sin empresa'}</div>
      <div class="client-meta">
        ${statusBadge(client.status)}
        ${client.webLink ? `<a href="${client.webLink}" target="_blank" class="meta-link">${ic.globe} Web</a>` : ''}
        ${client.githubLink ? `<a href="${client.githubLink}" target="_blank" class="meta-link">${ic.github} GitHub</a>` : ''}
        ${client.vercelLink ? `<a href="${client.vercelLink}" target="_blank" class="meta-link">${ic.link} Vercel</a>` : ''}
      </div>
    </div>
    <div class="flex-gap">
      <button class="btn btn-outline btn-sm" onclick="openClientModal('${client.id}')">${ic.edit} Editar</button>
    </div>
  </div>

  <div class="tabs">
    ${tabs.map(t => `
      <button class="tab-btn ${state.tab === t.id ? 'active' : ''}" onclick="switchTab('${t.id}')">
        ${t.icon} ${t.label}
      </button>`).join('')}
  </div>

  <div id="tab-content">
    ${tabContent}
  </div>

  <!-- Client Edit Modal (reuse clients modal) -->
  ${renderClientModal(client.id)}
  `;
}

function switchTab(tab) {
  state.tab = tab;
  const client = DB.clients.get(state.clientId);
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.onclick?.toString().includes(`'${tab}'`)));
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('onclick') === `switchTab('${tab}')`);
  });
  document.getElementById('tab-content').innerHTML = {
    general:     renderTabGeneral(client),
    project:     renderTabProject(client),
    changes:     renderTabChanges(client),
    payments:    renderTabPayments(client),
    expenses:    renderTabExpenses(client),
    credentials: renderTabCredentials(client),
    history:     renderTabHistory(client),
  }[tab] || '';
  bindClientDetailEvents(client);
}

function bindClientDetailEvents(client) {
  if (!client) return;
  document.getElementById('client-modal-form')?.addEventListener('submit', submitClientModal);
  document.getElementById('project-form')?.addEventListener('submit', e => { e.preventDefault(); submitProject(client.id); });
}

// ── Tab: General ───────────────────────────────────────────────── //
function renderTabGeneral(c) {
  const fields = [
    ['Nombre',            c.name],
    ['Empresa',           c.company],
    ['WhatsApp',          c.whatsapp ? `<a href="https://wa.me/${c.whatsapp.replace(/\D/g,'')}" target="_blank" style="color:var(--accent)">${c.whatsapp}</a>` : '—'],
    ['Email',             c.email ? `<a href="mailto:${c.email}" style="color:var(--accent)">${c.email}</a>` : '—'],
    ['Estado',            statusBadge(c.status)],
    ['Fecha de inicio',   fmt.date(c.startDate)],
    ['Servicio',          c.serviceType || '—'],
    ['Dominio',           c.domain || '—'],
    ['Proveedor dominio', c.domainProvider || '—'],
    ['Web',               c.webLink ? `<a href="${c.webLink}" target="_blank" style="color:var(--accent)">${c.webLink}</a>` : '—'],
    ['Vercel',            c.vercelLink ? `<a href="${c.vercelLink}" target="_blank" style="color:var(--accent)">${c.vercelLink}</a>` : '—'],
    ['GitHub',            c.githubLink ? `<a href="${c.githubLink}" target="_blank" style="color:var(--accent)">${c.githubLink}</a>` : '—'],
  ];

  return `
  <div class="card">
    <div class="card-header">
      <div class="card-title">Datos del cliente</div>
      <button class="btn btn-outline btn-sm" onclick="openClientModal('${c.id}')">${ic.edit} Editar</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem 2rem;">
      ${fields.map(([label, val]) => `
        <div>
          <div class="text-muted text-sm">${label}</div>
          <div style="margin-top:2px">${val || '—'}</div>
        </div>`).join('')}
    </div>
    ${c.notes ? `<hr class="divider"><div class="text-muted text-sm mb-1">Notas internas</div><p style="white-space:pre-wrap">${c.notes}</p>` : ''}
  </div>`;
}

// ── Tab: Project ───────────────────────────────────────────────── //
function renderTabProject(c) {
  const p = DB.projects.getByClient(c.id);
  return `
  <div class="card">
    <div class="card-header">
      <div class="card-title">Proyecto / Web</div>
    </div>
    <form id="project-form">
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Nombre del proyecto</label>
          <input type="text" id="pf-name" value="${p?.projectName||''}" placeholder="Mi Web" />
        </div>
        <div class="form-group">
          <label class="form-label">Tipo de web</label>
          <input type="text" id="pf-type" value="${p?.webType||''}" placeholder="Landing page, E-commerce..." />
        </div>
        <div class="form-group">
          <label class="form-label">Stack tecnológico</label>
          <input type="text" id="pf-stack" value="${p?.stack||''}" placeholder="Next.js, Tailwind, Vercel..." />
        </div>
        <div class="form-group">
          <label class="form-label">Repositorio GitHub</label>
          <input type="url" id="pf-github" value="${p?.github||''}" placeholder="https://github.com/..." />
        </div>
        <div class="form-group">
          <label class="form-label">Deploy / URL</label>
          <input type="url" id="pf-deploy" value="${p?.deploy||''}" placeholder="https://..." />
        </div>
        <div class="form-group">
          <label class="form-label">Dominio</label>
          <input type="text" id="pf-domain" value="${p?.domain||''}" placeholder="midominio.com" />
        </div>
        <div class="form-group">
          <label class="form-label">Fecha de entrega</label>
          <input type="date" id="pf-delivery" value="${p?.deliveryDate||''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Estado del proyecto</label>
          <select id="pf-status">
            ${['en_desarrollo','publicado','mantenimiento','pausado'].map(s =>
              `<option value="${s}" ${p?.status===s?'selected':''}>${{en_desarrollo:'En desarrollo',publicado:'Publicado',mantenimiento:'Mantenimiento',pausado:'Pausado'}[s]}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group form-full">
          <label class="form-label">Notas del proyecto</label>
          <textarea id="pf-notes" placeholder="Detalles técnicos, acuerdos, pendientes...">${p?.notes||''}</textarea>
        </div>
      </div>
      <div style="margin-top:1rem;display:flex;justify-content:flex-end">
        <button type="submit" class="btn btn-primary">${ic.check} Guardar proyecto</button>
      </div>
    </form>
  </div>`;
}

function submitProject(clientId) {
  const data = {
    projectName:  document.getElementById('pf-name').value.trim(),
    webType:      document.getElementById('pf-type').value.trim(),
    stack:        document.getElementById('pf-stack').value.trim(),
    github:       document.getElementById('pf-github').value.trim(),
    deploy:       document.getElementById('pf-deploy').value.trim(),
    domain:       document.getElementById('pf-domain').value.trim(),
    deliveryDate: document.getElementById('pf-delivery').value,
    status:       document.getElementById('pf-status').value,
    notes:        document.getElementById('pf-notes').value.trim(),
  };
  DB.projects.upsert(clientId, data);
  toast('Proyecto guardado');
}

// ── Tab: Changes ───────────────────────────────────────────────── //
function renderTabChanges(c) {
  const all = DB.changes.getByClient(c.id);
  const filterSt = (window._chFilter || 'all');

  const filtered = filterSt === 'all' ? all : all.filter(ch => ch.status === filterSt);

  return `
  <div class="flex-between mb-2">
    <div class="flex-gap">
      ${['all','pendiente','en_proceso','hecho'].map(s =>
        `<button class="btn btn-sm ${filterSt===s?'btn-primary':'btn-outline'}" onclick="window._chFilter='${s}';switchTab('changes')">
          ${{all:'Todos',pendiente:'Pendientes',en_proceso:'En proceso',hecho:'Hechos'}[s]}
        </button>`
      ).join('')}
    </div>
    <button class="btn btn-primary btn-sm" onclick="openChangeModal()">${ic.plus} Nuevo cambio</button>
  </div>

  <div class="card">
    ${filtered.length === 0
      ? `<div class="empty-state"><div class="empty-icon">${ic.list}</div><div class="empty-title">Sin cambios</div><div class="empty-sub">Cargá los cambios solicitados.</div></div>`
      : `<div class="table-wrap"><table>
          <thead><tr><th>Título</th><th>Prioridad</th><th>Estado</th><th>Solicitado</th><th>Finalizado</th><th></th></tr></thead>
          <tbody>
            ${filtered.map(ch => `
              <tr>
                <td>
                  <div><strong>${ch.title}</strong></div>
                  ${ch.description ? `<div class="td-muted text-sm">${ch.description}</div>` : ''}
                </td>
                <td>${priorityBadge(ch.priority)}</td>
                <td>${statusBadge(ch.status)}</td>
                <td class="td-muted">${fmt.date(ch.requestedAt)}</td>
                <td class="td-muted">${ch.finishedAt ? fmt.date(ch.finishedAt) : '—'}</td>
                <td>
                  <div class="flex-gap">
                    ${ch.status !== 'hecho' ? `<button class="btn btn-success btn-sm" onclick="markChangeDone('${ch.id}')" title="Marcar hecho">${ic.check}</button>` : ''}
                    <button class="btn btn-ghost btn-sm" onclick="openChangeModal('${ch.id}')">${ic.edit}</button>
                    <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deleteChange('${ch.id}')">${ic.trash}</button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table></div>`}
  </div>

  <!-- Change modal -->
  <div class="modal-overlay" id="change-modal">
    <div class="modal">
      <div class="modal-header"><span class="modal-title" id="change-modal-title">Nuevo cambio</span>
        <button class="modal-close" onclick="closeModal('change-modal')">${ic.plus}</button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="chm-id" />
        <div class="form-grid">
          <div class="form-group form-full">
            <label class="form-label">Título *</label>
            <input type="text" id="chm-title" placeholder="Cambio de color del botón..." />
          </div>
          <div class="form-group form-full">
            <label class="form-label">Descripción</label>
            <textarea id="chm-desc" placeholder="Detalle del cambio solicitado..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Fecha solicitada</label>
            <input type="date" id="chm-date" value="${new Date().toISOString().slice(0,10)}" />
          </div>
          <div class="form-group">
            <label class="form-label">Prioridad</label>
            <select id="chm-priority">
              <option value="baja">Baja</option>
              <option value="media" selected>Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select id="chm-status">
              <option value="pendiente" selected>Pendiente</option>
              <option value="en_proceso">En proceso</option>
              <option value="hecho">Hecho</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Fecha finalización</label>
            <input type="date" id="chm-finished" />
          </div>
          <div class="form-group form-full">
            <label class="form-label">Notas internas</label>
            <textarea id="chm-notes" placeholder="Notas privadas..."></textarea>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal('change-modal')">Cancelar</button>
        <button class="btn btn-primary" onclick="submitChange('${c.id}')">${ic.check} Guardar</button>
      </div>
    </div>
  </div>`;
}

function openChangeModal(id) {
  const ch = id ? DB.changes.getByClient(state.clientId).find(c => c.id === id) || DB.changes.getByClient(state.clientId).concat(JSON.parse(localStorage.getItem('aiw_changes')||'[]')).find(c => c.id === id) : null;
  document.getElementById('chm-id').value     = id || '';
  document.getElementById('chm-title').value  = ch?.title || '';
  document.getElementById('chm-desc').value   = ch?.description || '';
  document.getElementById('chm-date').value   = ch?.requestedAt || new Date().toISOString().slice(0,10);
  document.getElementById('chm-priority').value = ch?.priority || 'media';
  document.getElementById('chm-status').value   = ch?.status || 'pendiente';
  document.getElementById('chm-finished').value = ch?.finishedAt || '';
  document.getElementById('chm-notes').value  = ch?.notes || '';
  document.getElementById('change-modal-title').textContent = id ? 'Editar cambio' : 'Nuevo cambio';
  openModal('change-modal');
}

function submitChange(clientId) {
  const id = document.getElementById('chm-id').value;
  const data = {
    title:       document.getElementById('chm-title').value.trim(),
    description: document.getElementById('chm-desc').value.trim(),
    requestedAt: document.getElementById('chm-date').value,
    priority:    document.getElementById('chm-priority').value,
    status:      document.getElementById('chm-status').value,
    finishedAt:  document.getElementById('chm-finished').value,
    notes:       document.getElementById('chm-notes').value.trim(),
  };
  if (!data.title) { toast('El título es obligatorio', 'error'); return; }
  id ? DB.changes.update(id, data) : DB.changes.create(clientId, data);
  toast(id ? 'Cambio actualizado' : 'Cambio agregado');
  closeModal('change-modal');
  switchTab('changes');
}

function markChangeDone(id) {
  DB.changes.update(id, { status: 'hecho', finishedAt: new Date().toISOString().slice(0,10) });
  toast('Marcado como hecho');
  switchTab('changes');
}

function deleteChange(id) {
  confirm('¿Eliminar este cambio?', () => { DB.changes.delete(id); toast('Cambio eliminado'); switchTab('changes'); });
}

// ── Tab: Payments ──────────────────────────────────────────────── //
function renderTabPayments(c) {
  const pays = DB.payments.getByClient(c.id);
  const meta = DB.payments.getMeta(c.id);

  const totalPaid   = pays.filter(p => p.status === 'pagado').reduce((s, p) => s + p.amount, 0);
  const totalPending = pays.filter(p => p.status !== 'pagado').reduce((s, p) => s + p.amount, 0);
  const isLate      = pays.some(p => p.status === 'atrasado');

  return `
  <div class="summary-row">
    <div class="summary-item">
      <div class="summary-label">Monto inicial</div>
      <div class="summary-value">${fmt.money(meta.initialAmount || 0)}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Cuota mensual pactada</div>
      <div class="summary-value">${fmt.money(meta.monthlyAmount || 0)}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Total cobrado</div>
      <div class="summary-value green">${fmt.money(totalPaid)}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Total pendiente</div>
      <div class="summary-value ${totalPending > 0 ? 'yellow' : ''}">${fmt.money(totalPending)}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Estado de cuenta</div>
      <div class="summary-value">${isLate ? '<span class="badge badge-red">Atrasado</span>' : '<span class="badge badge-green">Al día</span>'}</div>
    </div>
  </div>

  <!-- Edit meta amounts -->
  <div class="card mb-2" style="padding:1rem 1.25rem">
    <div class="flex-gap" style="gap:1rem;flex-wrap:wrap">
      <div class="form-group" style="flex:1;min-width:150px">
        <label class="form-label">Monto inicial del trabajo</label>
        <input type="number" id="pm-initial" value="${meta.initialAmount||''}" placeholder="0" oninput="savePayMeta('${c.id}')" />
      </div>
      <div class="form-group" style="flex:1;min-width:150px">
        <label class="form-label">Cuota mensual pactada</label>
        <input type="number" id="pm-monthly" value="${meta.monthlyAmount||''}" placeholder="0" oninput="savePayMeta('${c.id}')" />
      </div>
    </div>
  </div>

  <div class="flex-between mb-2">
    <div class="card-title">Pagos registrados</div>
    <button class="btn btn-primary btn-sm" onclick="openPayModal()">${ic.plus} Registrar pago</button>
  </div>

  <div class="card">
    ${pays.length === 0
      ? `<div class="empty-state"><div class="empty-icon">${ic.dollar}</div><div class="empty-title">Sin pagos</div></div>`
      : `<div class="table-wrap"><table>
          <thead><tr><th>Fecha</th><th>Monto</th><th>Concepto</th><th>Método</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            ${pays.map(p => `
              <tr>
                <td class="td-muted">${fmt.date(p.paymentDate)}</td>
                <td><strong>${fmt.money(p.amount)}</strong></td>
                <td class="td-muted">${p.concept || '—'}</td>
                <td class="td-muted">${p.method || '—'}</td>
                <td>${statusBadge(p.status)}</td>
                <td>
                  <div class="flex-gap">
                    <button class="btn btn-ghost btn-sm" onclick="openPayModal('${p.id}')">${ic.edit}</button>
                    <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deletePay('${p.id}')">${ic.trash}</button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table></div>`}
  </div>

  <!-- Pay modal -->
  <div class="modal-overlay" id="pay-modal">
    <div class="modal">
      <div class="modal-header"><span class="modal-title" id="pay-modal-title">Registrar pago</span>
        <button class="modal-close" onclick="closeModal('pay-modal')">${ic.plus}</button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="paym-id" />
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Monto *</label>
            <input type="number" id="paym-amount" placeholder="0.00" />
          </div>
          <div class="form-group">
            <label class="form-label">Fecha de pago</label>
            <input type="date" id="paym-date" value="${new Date().toISOString().slice(0,10)}" />
          </div>
          <div class="form-group">
            <label class="form-label">Método</label>
            <select id="paym-method">
              <option value="">— Seleccionar —</option>
              <option>Transferencia</option><option>Efectivo</option>
              <option>MercadoPago</option><option>PayPal</option><option>Otro</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select id="paym-status">
              <option value="pagado" selected>Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="atrasado">Atrasado</option>
            </select>
          </div>
          <div class="form-group form-full">
            <label class="form-label">Concepto</label>
            <input type="text" id="paym-concept" placeholder="Cuota Mayo, Diseño inicial..." />
          </div>
          <div class="form-group form-full">
            <label class="form-label">Notas</label>
            <textarea id="paym-notes" placeholder="Notas del pago..."></textarea>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal('pay-modal')">Cancelar</button>
        <button class="btn btn-primary" onclick="submitPay('${c.id}')">${ic.check} Guardar</button>
      </div>
    </div>
  </div>`;
}

function savePayMeta(clientId) {
  DB.payments.saveMeta(clientId, {
    initialAmount: parseFloat(document.getElementById('pm-initial').value) || 0,
    monthlyAmount: parseFloat(document.getElementById('pm-monthly').value) || 0,
  });
}

function openPayModal(id) {
  const all = JSON.parse(localStorage.getItem('aiw_payments') || '[]');
  const p = id ? all.find(x => x.id === id) : null;
  document.getElementById('paym-id').value      = id || '';
  document.getElementById('paym-amount').value  = p?.amount || '';
  document.getElementById('paym-date').value    = p?.paymentDate || new Date().toISOString().slice(0,10);
  document.getElementById('paym-method').value  = p?.method || '';
  document.getElementById('paym-status').value  = p?.status || 'pagado';
  document.getElementById('paym-concept').value = p?.concept || '';
  document.getElementById('paym-notes').value   = p?.notes || '';
  document.getElementById('pay-modal-title').textContent = id ? 'Editar pago' : 'Registrar pago';
  openModal('pay-modal');
}

function submitPay(clientId) {
  const id = document.getElementById('paym-id').value;
  const data = {
    amount:      document.getElementById('paym-amount').value,
    paymentDate: document.getElementById('paym-date').value,
    method:      document.getElementById('paym-method').value,
    status:      document.getElementById('paym-status').value,
    concept:     document.getElementById('paym-concept').value.trim(),
    notes:       document.getElementById('paym-notes').value.trim(),
  };
  if (!data.amount) { toast('El monto es obligatorio', 'error'); return; }
  id ? DB.payments.update(id, data) : DB.payments.create(clientId, data);
  toast(id ? 'Pago actualizado' : 'Pago registrado');
  closeModal('pay-modal');
  switchTab('payments');
}

function deletePay(id) {
  confirm('¿Eliminar este pago?', () => { DB.payments.delete(id); toast('Pago eliminado'); switchTab('payments'); });
}

// ── Tab: Expenses ──────────────────────────────────────────────── //
function renderTabExpenses(c) {
  const exps = DB.expenses.getByClient(c.id);
  const total      = exps.reduce((s, e) => s + e.amount, 0);
  const monthly    = exps.filter(e => e.frequency === 'mensual').reduce((s, e) => s + e.amount, 0);
  const pays       = DB.payments.getByClient(c.id);
  const totalPaid  = pays.filter(p => p.status === 'pagado').reduce((s, p) => s + p.amount, 0);
  const netProfit  = totalPaid - total;

  return `
  <div class="summary-row">
    <div class="summary-item">
      <div class="summary-label">Total gastos</div>
      <div class="summary-value red">${fmt.money(total)}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Gasto mensual estimado</div>
      <div class="summary-value red">${fmt.money(monthly)}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Total cobrado</div>
      <div class="summary-value green">${fmt.money(totalPaid)}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Ganancia neta</div>
      <div class="summary-value ${netProfit >= 0 ? 'green' : 'red'}">${fmt.money(netProfit)}</div>
    </div>
  </div>

  <div class="flex-between mb-2">
    <div class="card-title">Gastos del cliente</div>
    <button class="btn btn-primary btn-sm" onclick="openExpModal()">${ic.plus} Nuevo gasto</button>
  </div>

  <div class="card">
    ${exps.length === 0
      ? `<div class="empty-state"><div class="empty-icon">${ic.trending}</div><div class="empty-title">Sin gastos</div></div>`
      : `<div class="table-wrap"><table>
          <thead><tr><th>Concepto</th><th>Monto</th><th>Frecuencia</th><th>Proveedor</th><th>Fecha</th><th></th></tr></thead>
          <tbody>
            ${exps.map(e => `
              <tr>
                <td><strong>${e.concept}</strong>${e.notes ? `<div class="td-muted text-sm">${e.notes}</div>` : ''}</td>
                <td><strong>${fmt.money(e.amount)}</strong></td>
                <td>${statusBadge2Exp(e.frequency)}</td>
                <td class="td-muted">${e.provider || '—'}</td>
                <td class="td-muted">${fmt.date(e.date)}</td>
                <td>
                  <div class="flex-gap">
                    <button class="btn btn-ghost btn-sm" onclick="openExpModal('${e.id}')">${ic.edit}</button>
                    <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deleteExp('${e.id}')">${ic.trash}</button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table></div>`}
  </div>

  <!-- Expense modal -->
  <div class="modal-overlay" id="exp-modal">
    <div class="modal">
      <div class="modal-header"><span class="modal-title" id="exp-modal-title">Nuevo gasto</span>
        <button class="modal-close" onclick="closeModal('exp-modal')">${ic.plus}</button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="expm-id" />
        <div class="form-grid">
          <div class="form-group form-full">
            <label class="form-label">Concepto *</label>
            <input type="text" id="expm-concept" placeholder="Dominio, Hosting, Plugin..." />
          </div>
          <div class="form-group">
            <label class="form-label">Monto *</label>
            <input type="number" id="expm-amount" placeholder="0.00" />
          </div>
          <div class="form-group">
            <label class="form-label">Frecuencia</label>
            <select id="expm-freq">
              <option value="unico">Único</option>
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Fecha</label>
            <input type="date" id="expm-date" value="${new Date().toISOString().slice(0,10)}" />
          </div>
          <div class="form-group">
            <label class="form-label">Plataforma / Proveedor</label>
            <input type="text" id="expm-provider" placeholder="Vercel, GoDaddy..." />
          </div>
          <div class="form-group form-full">
            <label class="form-label">Notas</label>
            <textarea id="expm-notes"></textarea>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal('exp-modal')">Cancelar</button>
        <button class="btn btn-primary" onclick="submitExp('${c.id}')">${ic.check} Guardar</button>
      </div>
    </div>
  </div>`;
}

function statusBadge2Exp(f) {
  return { unico: '<span class="badge badge-blue">Único</span>', mensual: '<span class="badge badge-purple">Mensual</span>', anual: '<span class="badge badge-cyan">Anual</span>' }[f] || `<span class="badge badge-gray">${f}</span>`;
}

function openExpModal(id) {
  const all = JSON.parse(localStorage.getItem('aiw_expenses') || '[]');
  const e = id ? all.find(x => x.id === id) : null;
  document.getElementById('expm-id').value       = id || '';
  document.getElementById('expm-concept').value  = e?.concept || '';
  document.getElementById('expm-amount').value   = e?.amount || '';
  document.getElementById('expm-freq').value     = e?.frequency || 'unico';
  document.getElementById('expm-date').value     = e?.date || new Date().toISOString().slice(0,10);
  document.getElementById('expm-provider').value = e?.provider || '';
  document.getElementById('expm-notes').value    = e?.notes || '';
  document.getElementById('exp-modal-title').textContent = id ? 'Editar gasto' : 'Nuevo gasto';
  openModal('exp-modal');
}

function submitExp(clientId) {
  const id = document.getElementById('expm-id').value;
  const data = {
    concept:   document.getElementById('expm-concept').value.trim(),
    amount:    document.getElementById('expm-amount').value,
    frequency: document.getElementById('expm-freq').value,
    date:      document.getElementById('expm-date').value,
    provider:  document.getElementById('expm-provider').value.trim(),
    notes:     document.getElementById('expm-notes').value.trim(),
  };
  if (!data.concept || !data.amount) { toast('Concepto y monto son obligatorios', 'error'); return; }
  id ? DB.expenses.update(id, data) : DB.expenses.create(clientId, data);
  toast(id ? 'Gasto actualizado' : 'Gasto registrado');
  closeModal('exp-modal');
  switchTab('expenses');
}

function deleteExp(id) {
  confirm('¿Eliminar este gasto?', () => { DB.expenses.delete(id); toast('Gasto eliminado'); switchTab('expenses'); });
}

// ── Tab: Credentials ───────────────────────────────────────────── //
function renderTabCredentials(c) {
  const creds = DB.credentials.getByClient(c.id);

  return `
  <div class="flex-between mb-2">
    <div>
      <div class="card-title">Accesos y credenciales</div>
      <div class="text-muted text-sm" style="margin-top:2px">Las contraseñas se almacenan codificadas — no compartir este panel.</div>
    </div>
    <button class="btn btn-primary btn-sm" onclick="openCredModal()">${ic.plus} Agregar acceso</button>
  </div>

  <div class="card">
    ${creds.length === 0
      ? `<div class="empty-state"><div class="empty-icon">${ic.key}</div><div class="empty-title">Sin accesos guardados</div></div>`
      : `<div class="table-wrap"><table>
          <thead><tr><th>Plataforma</th><th>Usuario</th><th>Contraseña</th><th>Link</th><th>Nota</th><th></th></tr></thead>
          <tbody>
            ${creds.map(cr => `
              <tr>
                <td><strong>${cr.platform}</strong></td>
                <td class="td-muted">${cr.user || '—'}</td>
                <td>
                  <div class="flex-gap" id="pass-wrap-${cr.id}">
                    <span class="credential-password" id="pass-${cr.id}">••••••••</span>
                    <button class="btn btn-ghost btn-sm" onclick="togglePass('${cr.id}','${cr.password}')" title="Mostrar/ocultar">${ic.eye}</button>
                    ${cr.password ? `<button class="btn btn-ghost btn-sm" onclick="copyPass('${cr.password}')" title="Copiar">${ic.copy}</button>` : ''}
                  </div>
                </td>
                <td>${cr.link ? `<a href="${cr.link}" target="_blank" class="meta-link">${ic.link} Abrir</a>` : '<span class="td-muted">—</span>'}</td>
                <td class="td-muted">${cr.note || '—'}</td>
                <td>
                  <div class="flex-gap">
                    <button class="btn btn-ghost btn-sm" onclick="openCredModal('${cr.id}')">${ic.edit}</button>
                    <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deleteCred('${cr.id}')">${ic.trash}</button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table></div>`}
  </div>

  <!-- Cred modal -->
  <div class="modal-overlay" id="cred-modal">
    <div class="modal">
      <div class="modal-header"><span class="modal-title" id="cred-modal-title">Agregar acceso</span>
        <button class="modal-close" onclick="closeModal('cred-modal')">${ic.plus}</button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="credm-id" />
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Plataforma *</label>
            <input type="text" id="credm-platform" placeholder="cPanel, Namecheap, Vercel..." />
          </div>
          <div class="form-group">
            <label class="form-label">Link de acceso</label>
            <input type="url" id="credm-link" placeholder="https://..." />
          </div>
          <div class="form-group">
            <label class="form-label">Usuario / Email</label>
            <input type="text" id="credm-user" placeholder="usuario@mail.com" />
          </div>
          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <input type="text" id="credm-pass" placeholder="Dejar vacío para no cambiar" />
          </div>
          <div class="form-group form-full">
            <label class="form-label">Nota</label>
            <textarea id="credm-note" placeholder="Permisos, observaciones..."></textarea>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal('cred-modal')">Cancelar</button>
        <button class="btn btn-primary" onclick="submitCred('${c.id}')">${ic.check} Guardar</button>
      </div>
    </div>
  </div>`;
}

function togglePass(id, encoded) {
  const el = document.getElementById('pass-' + id);
  if (!el) return;
  el.textContent = el.textContent === '••••••••' ? DB.credentials.decode(encoded) : '••••••••';
}

function copyPass(encoded) {
  navigator.clipboard.writeText(DB.credentials.decode(encoded))
    .then(() => toast('Contraseña copiada'))
    .catch(() => toast('No se pudo copiar', 'error'));
}

function openCredModal(id) {
  const all = JSON.parse(localStorage.getItem('aiw_credentials') || '[]');
  const cr = id ? all.find(x => x.id === id) : null;
  document.getElementById('credm-id').value       = id || '';
  document.getElementById('credm-platform').value = cr?.platform || '';
  document.getElementById('credm-link').value     = cr?.link || '';
  document.getElementById('credm-user').value     = cr?.user || '';
  document.getElementById('credm-pass').value     = '';
  document.getElementById('credm-note').value     = cr?.note || '';
  document.getElementById('cred-modal-title').textContent = id ? 'Editar acceso' : 'Agregar acceso';
  openModal('cred-modal');
}

function submitCred(clientId) {
  const id = document.getElementById('credm-id').value;
  const passInput = document.getElementById('credm-pass').value;
  const data = {
    platform: document.getElementById('credm-platform').value.trim(),
    link:     document.getElementById('credm-link').value.trim(),
    user:     document.getElementById('credm-user').value.trim(),
    note:     document.getElementById('credm-note').value.trim(),
  };
  if (passInput) data.password = passInput;
  if (!data.platform) { toast('La plataforma es obligatoria', 'error'); return; }

  if (id) {
    const all = JSON.parse(localStorage.getItem('aiw_credentials') || '[]');
    const existing = all.find(x => x.id === id);
    if (existing && !passInput) data.password = DB.credentials.decode(existing.password); // keep existing decoded
    DB.credentials.update(id, data);
  } else {
    DB.credentials.create(clientId, data);
  }
  toast(id ? 'Acceso actualizado' : 'Acceso guardado');
  closeModal('cred-modal');
  switchTab('credentials');
}

function deleteCred(id) {
  confirm('¿Eliminar esta credencial?', () => { DB.credentials.delete(id); toast('Credencial eliminada'); switchTab('credentials'); });
}

// ── Tab: History ───────────────────────────────────────────────── //
function renderTabHistory(c) {
  const hist = DB.history.getByClient(c.id);
  if (!hist.length) return `<div class="card"><div class="empty-state"><div class="empty-icon">${ic.clock}</div><div class="empty-title">Sin historial aún</div></div></div>`;

  const colorMap = {
    'Cliente creado':   ['success-dim', 'success'],
    'Cliente editado':  ['accent-dim',  'accent'],
    'Cambio agregado':  ['warning-dim', 'warning'],
    'Cambio marcado como hecho': ['success-dim', 'success'],
    'Cambio eliminado': ['danger-dim',  'danger'],
    'Pago cargado':     ['success-dim', 'success'],
    'Pago editado':     ['accent-dim',  'accent'],
    'Pago eliminado':   ['danger-dim',  'danger'],
    'Gasto cargado':    ['warning-dim', 'warning'],
    'Gasto eliminado':  ['danger-dim',  'danger'],
    'Proyecto actualizado': ['purple-dim', 'purple'],
    'Credencial agregada': ['info-dim',  'info'],
    'Credencial eliminada': ['danger-dim', 'danger'],
  };

  return `
  <div class="card">
    <div class="card-title mb-2">Historial de acciones</div>
    <div class="timeline">
      ${hist.map(h => {
        const [bg, fg] = colorMap[h.action] || ['bg-hover', 'text-secondary'];
        return `
        <div class="timeline-item">
          <div class="timeline-dot" style="background:var(--${bg});color:var(--${fg})">${ic.clock}</div>
          <div class="timeline-content">
            <div class="timeline-action">${h.action}${h.detail ? ` — <em>${h.detail}</em>` : ''}</div>
            <div class="timeline-time">${fmt.ts(h.ts)}</div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ── Init ───────────────────────────────────────────────────────── //
document.addEventListener('DOMContentLoaded', () => {
  // Sidebar nav
  document.querySelectorAll('.nav-item[data-view]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.view));
  });

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    sessionStorage.removeItem('aiw_session');
    window.location.href = 'login.html';
  });

  // Mobile hamburger
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebar-overlay');

  hamburger?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });

  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });

  // Close modals on overlay click
  document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) closeAllModals();
  });

  // Confirm modal buttons
  document.getElementById('confirm-no')?.addEventListener('click', () => closeModal('confirm-modal'));

  // Hash routing
  const hash = window.location.hash.replace('#', '');
  if (hash.startsWith('client/')) {
    const parts = hash.split('/');
    state.view = 'client';
    state.clientId = parts[1];
    state.tab = parts[2] || 'general';
  }

  renderApp();
});
