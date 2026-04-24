const EDGE_REGEX = /^[A-Z]->[A-Z]$/;

function validateEdge(rawEntry) {
  const trimmed = String(rawEntry ?? '').trim();

  if (!trimmed) {
    return { valid: false, trimmed };
  }

  if (!EDGE_REGEX.test(trimmed)) {
    return { valid: false, trimmed };
  }

  const [parent, child] = trimmed.split('->');

  if (parent === child) {
    return { valid: false, trimmed };
  }

  return {
    valid: true,
    trimmed,
    parent,
    child,
  };
}

module.exports = {
  validateEdge,
};