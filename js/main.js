/**
 * 近江屋ながおか — 共通 JavaScript v3
 * 全ページで読み込む
 */
(function(){
  'use strict';

  const gh     = document.getElementById('gh');
  const hbg    = document.getElementById('hbg');
  const gnav   = document.getElementById('gnav');
  const pgTop  = document.getElementById('pg-top');

  /* ── スクロール制御 ─────────────────── */
  function onScroll(){
    const y = window.scrollY;
    if(gh) gh.classList.toggle('scrolled', y > 50);
    if(pgTop) pgTop.classList.toggle('show', y > 300);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ── ページトップ ───────────────────── */
  if(pgTop) pgTop.addEventListener('click', () =>
    window.scrollTo({top:0,behavior:'smooth'})
  );

  /* ── ハンバーガー ───────────────────── */
  if(hbg && gnav){
    function setMenu(open){
      hbg.classList.toggle('open', open);
      gnav.classList.toggle('open', open);
      hbg.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }
    hbg.addEventListener('click', () => setMenu(!hbg.classList.contains('open')));
    gnav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', e => {
      if(hbg.classList.contains('open') &&
         !gnav.contains(e.target) && !hbg.contains(e.target)) setMenu(false);
    });
    document.addEventListener('keydown', e => {
      if(e.key === 'Escape') setMenu(false);
    });
  }

  /* ── スムーズスクロール ─────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e){
      const t = document.querySelector(this.getAttribute('href'));
      if(!t) return;
      e.preventDefault();
      const off = (gh ? gh.offsetHeight : 0) + 8;
      window.scrollTo({top: t.getBoundingClientRect().top + window.scrollY - off, behavior:'smooth'});
    });
  });

  /* ── 現在ページのナビをハイライト ────── */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#gnav a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if(href === path) a.classList.add('current');
  });

  /* ── フェードインアニメーション ──────── */
  const fadeEls = document.querySelectorAll('.fade');
  if(fadeEls.length){
    const io = new IntersectionObserver(entries => {
      entries.forEach((en, i) => {
        if(en.isIntersecting){
          setTimeout(() => en.target.classList.add('in'), i * 60);
          io.unobserve(en.target);
        }
      });
    },{threshold:.08,rootMargin:'0px 0px -28px 0px'});
    fadeEls.forEach(el => io.observe(el));
  }

  /* ── お問い合わせフォーム ────────────── */
  const form = document.getElementById('contact-form');
  const msg  = document.getElementById('form-msg');
  if(form && msg){
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('[required]').forEach(f => {
        f.style.borderColor = '';
        const empty = f.type==='checkbox' ? !f.checked : !f.value.trim();
        if(empty){ f.style.borderColor='#c62828'; ok=false; }
      });
      if(!ok){ showMsg('ng','必須項目をすべて入力・選択してください。'); return; }

      const emailEl = form.querySelector('[name=email]');
      if(emailEl && emailEl.value.trim() &&
         !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())){
        emailEl.style.borderColor='#c62828';
        showMsg('ng','メールアドレスの形式が正しくありません。'); return;
      }

      const sub = form.querySelector('[type=submit]');
      sub.disabled = true;
      sub.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 送信中…';

      try{
        // Formspree へ AJAX 送信（送信後もページ内に留まり、独自メッセージを表示）
        const data = new FormData(form);
        const res = await fetch(form.action,{
          method:'POST',
          headers:{'Accept':'application/json'},
          body:data
        });
        if(!res.ok) throw new Error('HTTP '+res.status);
        showMsg('ok','お問い合わせを受け付けました。担当者よりご連絡いたします。');
        form.reset();
      }catch(err){
        console.error(err);
        showMsg('ng','送信に失敗しました。お電話（0554-63-0140）でもご連絡いただけます。');
      }finally{
        sub.disabled = false;
        sub.innerHTML = '<i class="fas fa-paper-plane"></i> 送信する';
      }
    });
  }

  function showMsg(type, text){
    msg.className = 'form-msg ' + type;
    msg.textContent = text;
    msg.scrollIntoView({behavior:'smooth',block:'nearest'});
    if(type==='ok') setTimeout(()=>{msg.className='form-msg';msg.textContent='';},12000);
  }

})();
