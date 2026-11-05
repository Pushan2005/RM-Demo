(() => {
  const ROOT_ID = 'apg-demo-root';
  const NUDGE_ID = 'apg-demo-nudge';
  const DEBOUNCE_MS = 120;
  const DUPLICATE_WINDOW_MS = 900;
  const DEBUG_PREFIX = '[AI Parenting Guardrail Demo]';

  const NUDGE_COPY =
    'AI cannot know what your child is feeling from this description. Try creating a calm, pressure-free opportunity to talk and listen. Ask an open question, spend time together, and avoid making it feel like an interrogation. If you remain concerned about their wellbeing, consider qualified support.';

  const SELECTORS = {
    composer: ['#prompt-textarea', 'textarea[placeholder*="Message"]', 'textarea', 'div[contenteditable="true"][data-lexical-editor="true"]'],
    sendButton: ['button[data-testid="send-button"]', 'button[aria-label*="Send"]', 'form button[type="submit"]']
  };

  let debounceTimer = null;
  let observer = null;
  let lastIntent = { text: '', timestamp: 0 };

  function debug(message, context) {
    if (typeof console === 'undefined' || typeof console.debug !== 'function') {
      return;
    }
    if (context === undefined) {
      console.debug(DEBUG_PREFIX, message);
      return;
    }
    console.debug(DEBUG_PREFIX, message, context);
  }

  function queryFirst(selectors) {
    for (const selector of selectors) {
      const found = document.querySelector(selector);
      if (found) {
        return found;
      }
    }
    return null;
  }

  function getComposerElement() {
    return queryFirst(SELECTORS.composer);
  }

  function getSendButton() {
    return queryFirst(SELECTORS.sendButton);
  }

  function readComposerText() {
    const composer = getComposerElement();
    if (!composer) {
      return null;
    }

    const value = typeof composer.value === 'string' ? composer.value : composer.innerText;
    if (typeof value !== 'string') {
      return null;
    }

    return value.trim();
  }

  function getOrCreateRoot() {
    let root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement('div');
      root.id = ROOT_ID;
      root.setAttribute('aria-live', 'polite');
      document.body.appendChild(root);
    }
    return root;
  }

  function removeNudge() {
    const nudge = document.getElementById(NUDGE_ID);
    if (nudge) {
      nudge.remove();
    }
  }

  function positionNudge(panel) {
    const composer = getComposerElement();
    if (!composer) {
      panel.style.bottom = '16px';
      panel.style.left = '16px';
      return;
    }

    const rect = composer.getBoundingClientRect();
    const top = Math.max(16, rect.top - panel.offsetHeight - 12);
    const left = Math.max(16, Math.min(rect.left, window.innerWidth - panel.offsetWidth - 16));

    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
  }

  function renderNudge() {
    removeNudge();

    const root = getOrCreateRoot();
    const panel = document.createElement('section');
    panel.id = NUDGE_ID;
    panel.className = 'apg-demo-nudge';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Parenting guidance nudge');

    panel.innerHTML = `
      <p class="apg-demo-nudge__text"></p>
      <div class="apg-demo-nudge__actions">
        <button type="button" class="apg-demo-nudge__btn apg-demo-nudge__btn--primary" data-apg-action="continue">Continue to ChatGPT</button>
        <button type="button" class="apg-demo-nudge__btn" data-apg-action="dismiss">Dismiss</button>
      </div>
    `;

    panel.querySelector('.apg-demo-nudge__text').textContent = NUDGE_COPY;
    panel.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      const action = target.getAttribute('data-apg-action');
      if (action === 'continue' || action === 'dismiss') {
        removeNudge();
      }
    });

    root.appendChild(panel);
    positionNudge(panel);
  }

  function shouldIgnoreDuplicateIntent(text) {
    const now = Date.now();
    if (text === lastIntent.text && now - lastIntent.timestamp < DUPLICATE_WINDOW_MS) {
      return true;
    }
    lastIntent = { text, timestamp: now };
    return false;
  }

  function evaluatePromptAttempt(text) {
    const matcher = window.AIParentingGuardrailRules?.matchParentChildConnectionPrompt;
    if (typeof matcher !== 'function') {
      return;
    }

    const result = matcher(text);
    debug('Prompt checked (metadata only)', {
      textLength: text.length,
      matched: result.matched
    });

    if (result.matched) {
      renderNudge();
    }
  }

  function onSubmitIntent(source) {
    const text = readComposerText();
    if (text === null) {
      debug('Composer unreadable; skipping check', { source });
      return;
    }

    if (shouldIgnoreDuplicateIntent(text)) {
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      evaluatePromptAttempt(text);
    }, DEBOUNCE_MS);
  }

  function onKeyDown(event) {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }
    onSubmitIntent('enter-key');
  }

  function onClick(event) {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const sendButton = getSendButton();
    if (!sendButton) {
      return;
    }

    if (target === sendButton || sendButton.contains(target)) {
      onSubmitIntent('send-click');
    }
  }

  function startMutationObserver() {
    if (observer) {
      return;
    }

    observer = new MutationObserver(() => {
      const composerFound = Boolean(getComposerElement());
      if (composerFound) {
        debug('Composer detected');
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function init() {
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('click', onClick, true);
    window.addEventListener('resize', () => {
      const panel = document.getElementById(NUDGE_ID);
      if (panel) {
        positionNudge(panel);
      }
    });

    startMutationObserver();
    debug('Initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
