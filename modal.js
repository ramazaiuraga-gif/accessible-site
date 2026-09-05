// Accessible modal helper
(function () {
  const modal = document.getElementById('share-modal');
  const openButtons = document.querySelectorAll('[aria-controls="share-modal"]');
  const closeBtn = document.getElementById('modal-close');
  const pageRoot = document.body;
  let lastFocused = null;

  // Return array of focusable elements inside container
  function getFocusable(el) {
    const selectors = [
      'a[href]',
      'area[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'iframe',
      'object',
      'embed',
      '[contenteditable]',
      '[tabindex]:not([tabindex="-1"])'
    ];
    return Array.from(el.querySelectorAll(selectors.join(','))).filter(node => node.offsetWidth || node.offsetHeight || node.getClientRects().length);
  }

  function setBackgroundInert(isInert) {
    // Mark all body children except the modal as inert/aria-hidden
    Array.from(pageRoot.children).forEach(child => {
      if (child === modal) return;
      if ('inert' in child) {
        child.inert = isInert;
      } else {
        // fallback
        if (isInert) {
          child.setAttribute('aria-hidden', 'true');
        } else {
          child.removeAttribute('aria-hidden');
        }
      }
    });
  }

  function openModal(trigger) {
    lastFocused = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    setBackgroundInert(true);

    // focus management
    const focusable = getFocusable(modal);
    const first = focusable[0];
    if (first) first.focus();
    else modal.querySelector('.close-btn')?.focus();

    // attach listeners
    document.addEventListener('keydown', handleKeydown);
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    setBackgroundInert(false);
    document.removeEventListener('keydown', handleKeydown);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key === 'Tab') {
      // trap focus
      const focusable = getFocusable(modal);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    }
  }

  // open buttons
  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(btn);
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(btn);
      }
    });
  });

  // close button
  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
  });

  // click outside modal-content closes modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Optional: prevent scroll on open
  const observer = new MutationObserver(() => {
    if (modal.classList.contains('open')) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }
  });
  observer.observe(modal, { attributes: true, attributeFilter: ['class'] });

  // form submit example (AJAX-safe)
  const form = modal.querySelector('.share-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // simple validation example
    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    if (!name.value.trim() || !email.value.trim()) {
      // focus first invalid
      ( !name.value.trim() ? name : email ).focus();
      return;
    }
    // Simulate success then close
    closeModal();
    // Show a polite toast or live region in real app
    alert('Форма отправлена (демо)');
  });
})();
