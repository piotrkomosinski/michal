(() => {
  document.documentElement.classList.add('js');

  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.getElementById('nav');

  const onScroll = () => header && header.classList.toggle('is-solid', window.scrollY > 40 || header.hasAttribute('data-solid'));
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const closeNav = () => {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Otwórz menu');
    nav.classList.remove('is-open');
  };

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
      nav.classList.toggle('is-open', open);
    });
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) closeNav(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
  }

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const siblings = [...entry.target.parentElement.children].filter((el) => el.classList.contains('reveal'));
        entry.target.style.transitionDelay = `${Math.min(siblings.indexOf(entry.target), 5) * 80}ms`;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // Active nav link
  const links = nav ? [...nav.querySelectorAll('a[href^="#"]')] : [];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Contact form → opens the user's mail client with a prefilled message
  const form = document.querySelector('[data-contact-form]');
  if (form) {
    const status = form.querySelector('[data-form-status]');
    const setStatus = (msg, type) => {
      status.textContent = msg;
      status.className = `form-status ${type ? `is-${type}` : ''}`;
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const invalid = [];

      ['name', 'phone'].forEach((n) => {
        const input = form.elements[n];
        const ok = input.value.trim().length > 1;
        input.classList.toggle('is-invalid', !ok);
        if (!ok) invalid.push(input);
      });
      const email = form.elements.email;
      const emailOk = !email.value || email.checkValidity();
      email.classList.toggle('is-invalid', !emailOk);
      if (!emailOk) invalid.push(email);

      const kw = form.elements.kw;
      const kwOk = !kw.value || kw.checkValidity();
      kw.classList.toggle('is-invalid', !kwOk);
      if (!kwOk) invalid.push(kw);

      const consent = form.elements.consent;
      consent.closest('.consent').classList.toggle('is-invalid', !consent.checked);
      if (!consent.checked) invalid.push(consent);

      if (invalid.length) {
        setStatus(kwOk ? 'Uzupełnij wymagane pola oznaczone gwiazdką.' : 'Sprawdź numer KW – format: XX1X/00000000/0.', 'error');
        invalid[0].focus();
        return;
      }

      const infra = data.getAll('infra');
      const details = [
        `Imię i nazwisko: ${data.get('name')}`,
        `Telefon: ${data.get('phone')}`,
        data.get('email') && `E-mail: ${data.get('email')}`,
        data.get('kw') && `Numer KW: ${data.get('kw').toUpperCase()}`,
        infra.length && `Urządzenia na działce: ${infra.join(', ')}`,
      ].filter(Boolean).join('\n');
      const message = (data.get('message') || '').trim();
      const body = message ? `${details}\n\n${message}` : details;

      const subject = `Zapytanie – bezpłatna analiza służebności przesyłu${data.get('kw') ? ` (KW ${data.get('kw').toUpperCase()})` : ''}`;
      window.location.href = `mailto:ms@adwokatsieruga.pl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus('Otwieramy Twój program pocztowy z gotową wiadomością. Jeśli nic się nie stało, napisz na ms@adwokatsieruga.pl lub zadzwoń: +48 507 619 814.', 'ok');
    });

    form.addEventListener('input', (e) => {
      if (e.target.classList) e.target.classList.remove('is-invalid');
      if (e.target.name === 'consent') e.target.closest('.consent').classList.remove('is-invalid');
    });
  }
})();
