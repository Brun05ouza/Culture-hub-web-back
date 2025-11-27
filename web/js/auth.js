// Sistema de autenticação global

function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

function setUser(userData) {
  localStorage.setItem('user', JSON.stringify(userData));
}

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function isLoggedIn() {
  return getUser() !== null;
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

function logout() {
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; animation: fadeIn 0.2s;">
      <div style="background: white; padding: 2rem; border-radius: 1rem; max-width: 400px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: slideUp 0.3s;">
        <h3 style="font-size: 1.5rem; font-weight: bold; color: #1f2937; margin-bottom: 0.5rem;">Sair da conta?</h3>
        <p style="color: #6b7280; margin-bottom: 1.5rem;">Você tem certeza que deseja sair? Você precisará fazer login novamente.</p>
        <div style="display: flex; gap: 0.75rem;">
          <button onclick="this.closest('div').parentElement.remove()" style="flex: 1; padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; background: white; color: #374151; font-weight: 600; cursor: pointer;">Cancelar</button>
          <button onclick="confirmLogout()" style="flex: 1; padding: 0.75rem; border: none; border-radius: 0.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600; cursor: pointer;">Sair</button>
        </div>
      </div>
    </div>
    <style>
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    </style>
  `;
  document.body.appendChild(modal);
}

function confirmLogout() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('rememberMe');
  window.location.href = '/telaPrincipal.html';
}

async function updateUserProfile(userId, data) {
  const token = getToken();
  const r = await fetch(`/api/usuarios/${userId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error('Falha ao atualizar perfil');
  const updated = await r.json();
  setUser(updated);
  return updated;
}

async function handleCadastro(name, email, password) {
  const r = await fetch('/api/auth/cadastro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await r.json();
  if (data.success) {
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }
  throw new Error(data.error || 'Erro ao cadastrar');
}

async function handleLogin(email, password) {
  const r = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await r.json();
  if (data.success) {
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }
  throw new Error(data.error || 'Credenciais inválidas');
}

function updateAuthUI() {
  const user = getUser();
  const headerAuth = document.querySelector('.header-auth');
  
  if (!headerAuth) return;
  
  if (user) {
    headerAuth.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="hidden md:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-full border border-purple-200">
          <span class="text-sm text-gray-700">Olá, <strong class="text-purple-700">${user.name.split(' ')[0]}</strong></span>
        </div>
        <div class="relative">
          <div class="relative cursor-pointer" onclick="toggleUserMenu()">
            <img src="${user.picture}" alt="${user.name}" class="w-10 h-10 rounded-full border-2 border-purple-500 hover:border-purple-600 transition-all hover:scale-105">
            <span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div id="userMenu" class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 hidden overflow-hidden z-50">
            <div class="px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <p class="font-semibold">${user.name}</p>
              <p class="text-xs opacity-90">${user.email}</p>
            </div>
            <div class="py-2">
              <a href="telaPerfil.html" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Meu Perfil
              </a>
              <a href="meusEventos.html" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Meus Eventos
              </a>
              <a href="favoritos.html" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                Favoritos
              </a>
              <a href="notificacoes.html" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                Notificações
              </a>
              <a href="criarEventos.html" class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Criar Evento
              </a>
            </div>
            <div class="border-t">
              <button onclick="logout()" class="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    headerAuth.innerHTML = `
      <a href="login.html" class="nav-link login-link">Login</a>
      <a href="cadastro.html" class="btn btn-primary px-6 py-2 rounded-full">Cadastre-se</a>
    `;
  }
}

// Atualizar UI quando a página carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateAuthUI);
} else {
  updateAuthUI();
}

function toggleUserMenu() {
  const menu = document.getElementById('userMenu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

// Fechar menu ao clicar fora
document.addEventListener('click', function(event) {
  const menu = document.getElementById('userMenu');
  const userArea = event.target.closest('[onclick="toggleUserMenu()"]');
  
  if (menu && !menu.contains(event.target) && !userArea) {
    menu.classList.add('hidden');
  }
});

// Proteger páginas que requerem autenticação
function protectPage() {
  const protectedPages = ['criarEventos.html', 'meusEventos.html', 'editarPerfil.html', 'telaPerfil.html'];
  const currentPage = window.location.pathname.split('/').pop();
  
  if (protectedPages.includes(currentPage) && !isLoggedIn()) {
    window.location.href = '/login.html?redirect=' + currentPage;
  }
}

// Redirecionar após login
function handleLoginRedirect() {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  if (redirect && isLoggedIn()) {
    window.location.href = '/' + redirect;
  }
}

// Tornar funções globais
window.logout = logout;
window.confirmLogout = confirmLogout;
window.getUser = getUser;
window.setUser = setUser;
window.getToken = getToken;
window.setToken = setToken;
window.isLoggedIn = isLoggedIn;
window.requireAuth = requireAuth;
window.toggleUserMenu = toggleUserMenu;
window.updateUserProfile = updateUserProfile;
window.handleCadastro = handleCadastro;
window.handleLogin = handleLogin;

// Executar proteção ao carregar
document.addEventListener('DOMContentLoaded', () => {
  protectPage();
  handleLoginRedirect();
});
