
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Year
  const y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const toggle = document.getElementById('nav-toggle');
  const mobile = document.getElementById('nav-mobile');
  if(toggle && mobile){
    toggle.addEventListener('click',()=>{
      const open = mobile.classList.contains('hidden');
      mobile.classList.toggle('hidden');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // GSAP registration
  if(window.gsap){
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  }

  // Compute fixed header offset for smooth scrolling
  var headerEl = document.querySelector('header');
  var NAV_OFFSET = (headerEl ? headerEl.offsetHeight : 72) + 8;

  // Smooth scroll on nav links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id = a.getAttribute('href');
      if(!id || id === '#') return;
      const target = document.querySelector(id);
      if(!target) return;
      e.preventDefault();
      if(window.gsap && !prefersReduced){
        gsap.to(window, {duration: 0.8, scrollTo: {y: target, offsetY: NAV_OFFSET}, ease: 'power2.out'});
      } else {
        window.scrollTo({top: (target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET), behavior: 'smooth'});
      }
      if(mobile && !mobile.classList.contains('hidden')) mobile.classList.add('hidden');
    });
  });

  // Active link highlighting
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const links = Array.from(document.querySelectorAll('.nav-link'));
  const map = new Map(sections.map(s=>[s.id, links.find(l=>l.getAttribute('href')==='#'+s.id)]));
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      const l = map.get(ent.target.id);
      if(!l) return;
      if(ent.isIntersecting){
        links.forEach(el=>el.classList.remove('active'));
        l.classList.add('active');
      }
    });
  },{rootMargin:'-40% 0px -55% 0px', threshold: [0,0.25,0.5,0.75,1]});
  sections.forEach(s=>io.observe(s));

  // Hero staggered text reveal
  function splitAndAnimate(selector, delay){
    const el = document.querySelector(selector); if(!el) return;
    const text = el.textContent || '';
    el.textContent = '';
    const frag = document.createDocumentFragment();
    text.split(' ').forEach((w,i)=>{
      const span = document.createElement('span');
      span.textContent = w + (i<text.split(' ').length-1 ? ' ' : '');
      span.style.display='inline-block';
      span.style.opacity='0';
      span.style.transform='translateY(16px)';
      frag.appendChild(span);
    });
    el.appendChild(frag);
    if(window.gsap && !prefersReduced){
      gsap.to(el.children, {opacity:1, y:0, duration:0.8, ease:'power3.out', stagger:0.06, delay});
    } else {
      Array.from(el.children).forEach(s=>{s.style.opacity='1'; s.style.transform='none';});
    }
  }
  splitAndAnimate('.hero-name', 0.2);
  splitAndAnimate('.hero-title', 0.6);

  // Section reveal on scroll
  if(window.gsap && !prefersReduced){
    document.querySelectorAll('.section').forEach(section=>{
      const items = section.querySelectorAll('h2, p, .rounded-xl, article');
      gsap.set(items, {opacity:0, y:24});
      gsap.to(items, {
        opacity:1, y:0, duration:0.8, ease:'power3.out',
        stagger:0.08,
        scrollTrigger:{
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });
    });
  }

  // Parallax subtle depth on hero background elements (optimized)
  if(window.gsap && !prefersReduced){
    document.querySelectorAll('.parallax').forEach(function(el){
      var depth = parseFloat(el.dataset.depth || '0.4');
      gsap.to(el, { y: -60*depth, ease:'none', scrollTrigger:{ trigger: document.body, start:'top top', end:'bottom bottom', scrub:0.3 }});
    });
  }

  // Skills progress bars
  const skills = document.querySelector('#skills');
  if(skills){
    const bars = skills.querySelectorAll('.progress');
    const obs = new IntersectionObserver((ents,ob)=>{
      ents.forEach(ent=>{
        if(ent.isIntersecting){
          bars.forEach(b=>{
            const pct = parseInt(b.getAttribute('data-progress')||'0',10);
            if(window.gsap && !prefersReduced){
              gsap.to(b, {width: pct+'%', duration:1.2, ease:'power2.out'});
            }else{ b.style.width = pct+'%'; }
          });
          ob.disconnect();
        }
      });
    },{threshold:0.3});
    obs.observe(skills);
  }

  // Back to top
  const topBtn = document.getElementById('backToTop');
  function toggleTop(){
    const show = window.scrollY > 300;
    if(show){ topBtn && topBtn.classList.add('show'); } else { topBtn && topBtn.classList.remove('show'); }
  }
  window.addEventListener('scroll', toggleTop, {passive:true});
  toggleTop();
  if(topBtn){
    topBtn.addEventListener('click',()=>{
      if(window.gsap && !prefersReduced){ gsap.to(window,{duration:0.8, scrollTo:0, ease:'power2.out'}); }
      else { window.scrollTo({top:0, behavior:'smooth'}); }
    });
  }
})();

// Theme toggle
(function(){
  var doc = document.documentElement;
  function setTheme(dark, animate){
    if(animate){ doc.classList.add('theme-anim'); setTimeout(function(){doc.classList.remove('theme-anim')}, 500); }
    if(dark){ doc.classList.add('dark'); } else { doc.classList.remove('dark'); }
    try{ localStorage.setItem('theme', dark ? 'dark' : 'light'); }catch(e){}
    var t = document.getElementById('theme-toggle');
    if(t){ t.setAttribute('aria-pressed', dark ? 'true' : 'false'); }
  }
  var toggle = document.getElementById('theme-toggle');
  if(toggle){
    toggle.addEventListener('click', function(){ setTheme(!doc.classList.contains('dark'), true); });
    toggle.setAttribute('aria-pressed', doc.classList.contains('dark') ? 'true' : 'false');
  }
})();

