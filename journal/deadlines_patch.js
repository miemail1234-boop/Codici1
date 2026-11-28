(() => {
  'use strict';

  const nav = document.getElementById('sectionNav');
  if (!nav) return;

  const link = document.createElement('a');
  link.id = 'deadlineTab';
  link.className = 'section-tab';
  link.textContent = 'Scadenze';
  link.setAttribute('aria-label', 'Scadenze: cerca Cose da fare in Google Calendar');
  link.href = 'https://calendar.google.com/';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  nav.insertBefore(link, document.getElementById('instructionsTab'));
})();
