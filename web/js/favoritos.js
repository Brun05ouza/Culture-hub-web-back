// Sistema de favoritos
function toggleFavorito(eventoId, titulo, data, imagem) {
  let favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
  const index = favoritos.findIndex(f => f.id === eventoId);
  
  if (index > -1) {
    favoritos.splice(index, 1);
    showToast('Removido dos favoritos', 'info');
  } else {
    favoritos.push({ id: eventoId, titulo, data, imagem });
    showToast('Adicionado aos favoritos ❤️', 'success');
  }
  
  localStorage.setItem('favoritos', JSON.stringify(favoritos));
  updateFavoritoBtn(eventoId);
}

function isFavorito(eventoId) {
  const favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
  return favoritos.some(f => f.id === eventoId);
}

function updateFavoritoBtn(eventoId) {
  const btn = document.querySelector(`[data-favorito="${eventoId}"]`);
  if (btn) {
    btn.innerHTML = isFavorito(eventoId) ? '❤️' : '🤍';
  }
}

function showToast(message, type) {
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6'
  };
  
  const toast = document.createElement('div');
  toast.innerHTML = `
    <div style="position: fixed; top: 20px; right: 20px; background: ${colors[type]}; color: white; padding: 1rem 1.5rem; border-radius: 0.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 10000; animation: slideIn 0.3s;">
      ${message}
    </div>
    <style>
      @keyframes slideIn { from { transform: translateX(400px); } to { transform: translateX(0); } }
    </style>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

window.toggleFavorito = toggleFavorito;
window.isFavorito = isFavorito;
