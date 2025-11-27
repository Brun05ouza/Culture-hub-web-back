// /web/js/script.js

// ------- util -------
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

async function apiGetEventos(filters = {}) {
  const params = new URLSearchParams(filters);
  const r = await fetch(`/api/eventos?${params}`);
  return r.json();
}

async function apiGetEvento(id) {
  const r = await fetch(`/api/eventos/${id}`);
  if (!r.ok) throw new Error("Evento não encontrado");
  return r.json();
}

async function apiPostEvento(payload) {
  const user = getUser();
  if (user) payload.criadorId = user.id;
  const r = await fetch("/api/eventos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("Falha ao criar evento");
  return r.json();
}

async function apiUpdateEvento(id, payload) {
  const r = await fetch(`/api/eventos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("Falha ao atualizar evento");
  return r.json();
}

async function apiDeleteEvento(id) {
  const r = await fetch(`/api/eventos/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("Falha ao deletar evento");
}

async function apiInscreverEvento(eventoId, usuarioId) {
  const r = await fetch(`/api/eventos/${eventoId}/inscrever`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuarioId }),
  });
  if (!r.ok) throw new Error("Falha ao inscrever");
  return r.json();
}

async function apiCancelarInscricao(eventoId, usuarioId) {
  const r = await fetch(`/api/eventos/${eventoId}/inscrever`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuarioId }),
  });
  if (!r.ok) throw new Error("Falha ao cancelar inscrição");
  return r.json();
}

async function apiGetUserEventos(userId) {
  const r = await fetch(`/api/usuarios/${userId}/eventos`);
  return r.json();
}

// ------- “olho” da senha (login/cadastro) -------
function setupPasswordToggles() {
  $$(".pw-toggle").forEach((btn) => {
    const targetId = btn.getAttribute("data-target");
    const input =
      targetId ? document.getElementById(targetId) : btn.previousElementSibling;
    if (!input) return;
    btn.addEventListener("click", () => {
      const isPwd = input.type === "password";
      input.type = isPwd ? "text" : "password";
      btn.setAttribute("aria-pressed", String(isPwd));
      btn.innerHTML = isPwd
        ? '<i data-lucide="eye-off"></i>'
        : '<i data-lucide="eye"></i>';
      // re-render ícones lucide
      setTimeout(() => {
        if (window.lucide) window.lucide.createIcons();
      }, 10);
    });
  });
}

// ------- botão “Continuar como convidado” (login) -------
function setupGuestLogin() {
  const btn = $("#guestLogin");
  if (btn) {
    btn.addEventListener("click", () => {
      window.location.href = "/telaPrincipal.html";
    });
  }
}

// ------- criarEventos.html -------
function setupCriarEventos() {
  const form = $("#promoMedia") ? $("form") : null;
  if (!form) return;

  if (!isLoggedIn()) {
    showNotification("Você precisa estar logado para criar eventos", "warning");
    setTimeout(() => window.location.href = "/login.html", 2000);
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Criando...";

    const payload = {
      eventTitle: $("#eventTitle").value.trim(),
      eventDescription: $("#eventDescription").value.trim(),
      eventCategory: $("#eventCategory").value,
      startDate: $("#startDate").value,
      endDate: $("#endDate").value || $("#startDate").value,
      eventLocation: $("#eventLocation").value.trim(),
      ticketPrice: $("#ticketPrice").value || 0,
      ticketAvailability: $("#ticketAvailability").value || 0,
    };

    try {
      await apiPostEvento(payload);
      showNotification("Evento criado com sucesso!", "success");
      setTimeout(() => window.location.href = "/meusEventos.html", 1500);
    } catch (err) {
      showNotification("Erro ao criar: " + err.message, "error");
      btn.disabled = false;
      btn.textContent = "Salvar Evento";
    }
  });
}

// ------- telaCalendario.html -------
async function setupCalendario() {
  const form = $("#addEventForm");
  const list = $("#eventsList");
  if (!form || !list) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      eventName: $("#eventName").value.trim(),
      eventDate: $("#eventDate").value, // yyyy-mm-dd
      eventTime: $("#eventTime").value, // hh:mm
      eventLocation: $("#eventLocation").value.trim(),
      eventDescription: $("#eventDescription").value.trim(),
    };
    try {
      await apiPostEvento(payload);
      form.reset();
      await renderEventos(list);
    } catch (err) {
      alert("Erro ao registrar: " + err.message);
    }
  });

  // filtro simples por data (botão chama filterEventsByDate() no HTML)
  window.filterEventsByDate = async () => {
    await renderEventos(list, $("#eventDateSearch").value);
  };

  await renderEventos(list);
}

async function renderEventos(container, dateFilter = "") {
  const data = await apiGetEventos();
  container.innerHTML = "";
  const items = data.filter((e) =>
    dateFilter ? String(e.dataInicio).startsWith(dateFilter) : true
  );
  if (!items.length) {
    container.innerHTML =
      '<p class="text-gray-500 text-center col-span-full">Sem eventos.</p>';
    return;
  }
  for (const ev of items) {
    const card = document.createElement("article");
    card.className =
      "bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm";
    card.innerHTML = `
      <div class="p-4">
        <h3 class="font-semibold text-lg text-gray-900">${ev.tituloEvento}</h3>
        <p class="text-sm text-gray-500">
          ${formatDateTime(ev.dataInicio)} • ${ev.localizacao || ""}
        </p>
        <p class="text-sm text-gray-600 mt-2">${ev.descricao || ""}</p>
        <span class="badge ${ev.disponibilidade === "Disponivel" ? "badge-success" : "badge-danger"}">
          ${ev.disponibilidade || "—"}
        </span>
      </div>`;
    container.appendChild(card);
  }
}
function formatDateTime(dt) {
  const d = new Date(dt);
  if (isNaN(d)) return dt;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(dt) {
  const d = new Date(dt);
  if (isNaN(d)) return dt;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function validateEventDates(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  
  if (start < now) return { valid: false, message: 'Data de início não pode ser no passado' };
  if (end < start) return { valid: false, message: 'Data de término deve ser após a data de início' };
  return { valid: true };
}

// ------- meusEventos.html -------
async function setupMeusEventos() {
  const created = $("#createdEventsList");
  const registered = $("#registeredEventsList");
  if (!created && !registered) return;

  const user = getUser();
  if (!user) {
    showNotification("Você precisa estar logado", "warning");
    setTimeout(() => window.location.href = "/login.html", 2000);
    return;
  }

  try {
    const { criados, inscritos } = await apiGetUserEventos(user.id);

    if (created) {
      created.innerHTML = criados.length ? criados.map(ev => createEventCard(ev, true)).join("") : '<p class="text-gray-500 col-span-full text-center">Você ainda não criou eventos</p>';
    }

    if (registered) {
      registered.innerHTML = inscritos.length ? inscritos.map(ev => createEventCard(ev, false)).join("") : '<p class="text-gray-500 col-span-full text-center">Você ainda não está inscrito em eventos</p>';
    }
  } catch (err) {
    showNotification("Erro ao carregar eventos: " + err.message, "error");
  }
}

function createEventCard(ev, isOwner) {
  const status = getEventStatus(ev);
  return `
    <div class="event-card">
      <img src="${ev.imagem || `https://placehold.co/400x200/E5E7EB/4B5563?text=${encodeURIComponent(ev.categoria)}`}" class="w-full h-40 object-cover rounded-t-lg" alt="">
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-1">${ev.tituloEvento}</h3>
        <p class="text-sm text-gray-500 mb-2">${formatDateTime(ev.dataInicio)}</p>
        <span class="badge badge-${status.class}">${status.text}</span>
        <div class="mt-3 flex gap-2">
          ${isOwner ? `
            <button onclick="editEvent(${ev.id})" class="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Editar</button>
            <button onclick="deleteEvent(${ev.id})" class="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Excluir</button>
          ` : `
            <button onclick="cancelInscricao(${ev.id})" class="text-sm px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">Cancelar Inscrição</button>
          `}
        </div>
      </div>
    </div>
  `;
}

function getEventStatus(ev) {
  const now = new Date();
  const inicio = new Date(ev.dataInicio);
  const fim = new Date(ev.dataFim);
  if (now >= inicio && now <= fim) return { text: 'Ao vivo', class: 'success' };
  if (now < inicio) return { text: 'Próximo', class: 'warning' };
  return { text: 'Encerrado', class: 'danger' };
}

window.editEvent = async (id) => {
  window.location.href = `/criarEventos.html?edit=${id}`;
};

window.deleteEvent = async (id) => {
  if (!confirm('Tem certeza que deseja excluir este evento?')) return;
  try {
    await apiDeleteEvento(id);
    showNotification('Evento excluído com sucesso', 'success');
    setTimeout(() => location.reload(), 1000);
  } catch (err) {
    showNotification('Erro ao excluir: ' + err.message, 'error');
  }
};

window.cancelInscricao = async (eventoId) => {
  const user = getUser();
  if (!user) return;
  try {
    await apiCancelarInscricao(eventoId, user.id);
    showNotification('Inscrição cancelada', 'success');
    setTimeout(() => location.reload(), 1000);
  } catch (err) {
    showNotification('Erro ao cancelar: ' + err.message, 'error');
  }
}





// ------- Header melhorado -------
function setupEnhancedHeader() {
  // Efeito de scroll no header
  let lastScrollY = window.scrollY;
  
  window.addEventListener('scroll', () => {
    const header = $('header');
    if (!header) return;
    
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScrollY = window.scrollY;
  });
}

// Menu mobile
function toggleMobileMenu() {
  const menu = $('#mobileMenu');
  const hamburger = $('.hamburger');
  
  if (menu && hamburger) {
    menu.classList.toggle('show');
    hamburger.classList.toggle('active');
  }
}

// Tornar função global
window.toggleMobileMenu = toggleMobileMenu;

// ------- Destacar link ativo no header -------
function highlightActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'telaPrincipal.html';
  const navLinks = $$('nav a[href]');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'telaPrincipal.html')) {
      link.classList.add('text-blue-600');
      link.classList.remove('text-gray-600');
    } else {
      link.classList.remove('text-blue-600');
      link.classList.add('text-gray-600');
    }
  });
}

// ------- Google Sign-In -------
function setupGoogleAuth() {
  const loginBtn = $("#googleLogin");
  const registerBtn = $("#googleRegister");
  
  if (loginBtn) {
    loginBtn.addEventListener("click", handleGoogleSignIn);
  }
  if (registerBtn) {
    registerBtn.addEventListener("click", handleGoogleSignIn);
  }
}

function handleGoogleSignIn() {
  if (typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.initialize({
      client_id: "876423430315-el42ghklu3b6m2dcleeo3ua4cmot8v9b.apps.googleusercontent.com",
      callback: handleGoogleResponse
    });
    google.accounts.id.prompt();
  } else {
    alert('Google Sign-In não está disponível');
  }
}

function handleGoogleResponse(response) {
  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    const userData = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture
    };
    localStorage.setItem('user', JSON.stringify(userData));
    window.location.href = "/telaPrincipal.html";
  } catch (error) {
    console.error('Erro no login Google:', error);
    alert('Erro ao fazer login com Google');
  }
}

// ------- Notificações -------
function showNotification(message, type = 'info') {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };
  
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ------- Pesquisa de eventos -------
function setupSearch() {
  const searchInput = document.querySelector('input[placeholder*="Pesquisar"]');
  if (!searchInput) return;

  let timeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      const term = e.target.value.trim();
      if (term.length < 2) return;
      try {
        const eventos = await apiGetEventos({ search: term });
        displaySearchResults(eventos);
      } catch (err) {
        console.error('Erro na busca:', err);
      }
    }, 500);
  });
}

function displaySearchResults(eventos) {
  console.log('Resultados da busca:', eventos);
}

// ------- boot -------
document.addEventListener("DOMContentLoaded", () => {
  setupPasswordToggles();
  setupGuestLogin();
  setupGoogleAuth();
  setupEnhancedHeader();
  highlightActiveNavLink();
  setupSearch();
  setupCriarEventos();
  setupCalendario();
  setupMeusEventos();
});
