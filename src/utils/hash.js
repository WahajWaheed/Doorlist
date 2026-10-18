// Frontend-only auth simulation: we still avoid putting plain-text passwords in
// localStorage by storing a salted SHA-256 digest. This is NOT real security -
// a production app would do this on a server with a proper KDF (bcrypt/argon2).
export async function hashPassword(password, salt) {
  const input = `${salt}::${password}`;
  if (globalThis.crypto?.subtle) {
    const buf = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // very old / insecure-context fallback (djb2)
  let h = 5381;
  for (const ch of input) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0;
  return `weak-${h.toString(16)}`;
}
