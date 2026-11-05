(() => {
  const PHRASES = [
    "doesn't talk to me",
    "not talking to me",
    "won't talk to me",
    "hiding something from me",
    "keeps secrets",
    "doesn't tell me anything",
    "what is my child thinking",
    "make my child tell me"
  ];

  function normalize(input) {
    return String(input || '').toLowerCase();
  }

  function matchParentChildConnectionPrompt(input) {
    const normalized = normalize(input);
    if (!normalized.trim()) {
      return { matched: false };
    }

    const matchedPhrase = PHRASES.find((phrase) => normalized.includes(phrase));
    return {
      matched: Boolean(matchedPhrase),
      matchedPhrase: matchedPhrase || null
    };
  }

  window.AIParentingGuardrailRules = {
    PHRASES,
    matchParentChildConnectionPrompt
  };
})();
