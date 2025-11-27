// Utilitários gerais

// Debounce para otimizar eventos
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle para limitar execuções
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Validação de email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validação de senha forte
function isStrongPassword(password) {
  return password.length >= 8 && 
         /[a-z]/.test(password) && 
         /[A-Z]/.test(password) && 
         /\d/.test(password);
}

// Formatar moeda
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Formatar data relativa
function formatRelativeTime(date) {
  const now = new Date();
  const target = new Date(date);
  const diff = target - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days < 0) return 'Evento encerrado';
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Amanhã';
  if (days < 7) return `Em ${days} dias`;
  if (days < 30) return `Em ${Math.floor(days / 7)} semanas`;
  return `Em ${Math.floor(days / 30)} meses`;
}

// Copiar para clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Erro ao copiar:', err);
    return false;
  }
}

// Compartilhar (Web Share API)
async function shareEvent(eventData) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: eventData.titulo,
        text: eventData.descricao,
        url: window.location.href
      });
      return true;
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
      return false;
    }
  }
  return false;
}

// Gerar slug
function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Truncar texto
function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

// Detectar dispositivo móvel
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Scroll suave para elemento
function smoothScrollTo(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Loading overlay
function showLoading() {
  const overlay = document.createElement('div');
  overlay.id = 'loadingOverlay';
  overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  overlay.innerHTML = '<div class="spinner"></div>';
  document.body.appendChild(overlay);
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.remove();
}

// Confirmar ação
function confirmAction(message) {
  return confirm(message);
}

// Exportar funções
if (typeof window !== 'undefined') {
  window.utils = {
    debounce,
    throttle,
    isValidEmail,
    isStrongPassword,
    formatCurrency,
    formatRelativeTime,
    copyToClipboard,
    shareEvent,
    generateSlug,
    truncate,
    isMobile,
    smoothScrollTo,
    showLoading,
    hideLoading,
    confirmAction
  };
}
