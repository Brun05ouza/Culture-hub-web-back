(function(){
  const onReady = (fn)=> document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded', fn)
    : fn();

  onReady(function(){
    const bar  = document.getElementById('filtersBar');
    const grid = document.getElementById('featuredEvents');
    const liveBar = document.getElementById('liveNowBar');
    if (!bar || !grid) return;

    const cards = [...grid.querySelectorAll('.event-card')];
    const slug = (s='') => s.toString()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLowerCase().replace(/[^a-z0-9]+/g,'');

    cards.forEach(c=>{
      if (c.dataset.category) c.dataset.category = slug(c.dataset.category);
      if (c.dataset.status)   c.dataset.status   = slug(c.dataset.status);
    });

    const cats = ['musica','teatro','cinema','arte','comedia','literatura','danca','gastronomia'];
    const count = {
      'status:*'      : cards.length,
      'status:ongoing': cards.filter(c=>c.dataset.status==='ongoing').length,
      'status:upcoming':cards.filter(c=>c.dataset.status==='upcoming').length,
      'status:ended'  : cards.filter(c=>c.dataset.status==='ended').length,
    };
    cats.forEach(cat => count['cat:'+cat] = cards.filter(c=>c.dataset.category===cat).length);

    // Mostrar barra de eventos ao vivo
    if (liveBar && count['status:ongoing'] > 0) {
      liveBar.classList.remove('hidden');
      const liveCount = document.getElementById('liveCount');
      if (liveCount) liveCount.textContent = count['status:ongoing'];
      
      liveBar.addEventListener('click', () => {
        const ongoingBtn = bar.querySelector('[data-filter="status:ongoing"]');
        if (ongoingBtn) ongoingBtn.click();
        liveBar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }

    bar.querySelectorAll('.chip').forEach(ch=>{
      const key = ch.dataset.filter, n = count[key];
      if (typeof n === 'number') {
        let b = ch.querySelector('.count');
        if (!b) { b = document.createElement('span'); b.className='count'; ch.appendChild(b); }
        b.textContent = n;
        if (n === 0) ch.style.opacity = '0.5';
      }
    });

    let activeFilters = { status: '*', category: null };

    bar.addEventListener('click', (e)=>{
      const btn = e.target.closest('.chip'); 
      if (!btn) return;
      
      const [type, raw] = (btn.dataset.filter || 'status:*').split(':');
      const val = raw === '*' ? '*' : slug(raw);

      if (type === 'status') {
        bar.querySelectorAll('[data-filter^="status:"]').forEach(c=> c.classList.remove('is-active'));
        activeFilters.status = val;
      } else if (type === 'cat') {
        const wasActive = btn.classList.contains('is-active');
        bar.querySelectorAll('[data-filter^="cat:"]').forEach(c=> c.classList.remove('is-active'));
        activeFilters.category = wasActive ? null : val;
      }
      
      btn.classList.toggle('is-active');
      applyFilters();
    });

    function applyFilters() {
      let visibleCount = 0;
      cards.forEach(card=>{
        const st = card.dataset.status || '';
        const cat = card.dataset.category || '';
        let show = true;
        
        if (activeFilters.status !== '*' && st !== activeFilters.status) show = false;
        if (activeFilters.category && cat !== activeFilters.category) show = false;
        
        card.style.display = show ? '' : 'none';
        if (show) visibleCount++;
      });

      if (visibleCount === 0) {
        let noResults = grid.querySelector('.no-results');
        if (!noResults) {
          noResults = document.createElement('p');
          noResults.className = 'no-results col-span-full text-center text-gray-500 py-8';
          noResults.textContent = 'Nenhum evento encontrado com os filtros selecionados';
          grid.appendChild(noResults);
        }
        noResults.style.display = 'block';
      } else {
        const noResults = grid.querySelector('.no-results');
        if (noResults) noResults.style.display = 'none';
      }
    }

    console.log('[home-filters] ok');
  });
})();
