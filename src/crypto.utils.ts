export type Encrypted = {
  cipher: ArrayBuffer;
  iv: Uint8Array;
};

const ALGORITHM = { name: 'AES-GCM', length: 256 };

async function deriveKey(password: string): Promise<CryptoKey> {
  const algo = {
    name: 'PBKDF2',
    hash: 'SHA-256',
    salt: new TextEncoder().encode('a-unique-salt'),
    iterations: 1000
  };
  return crypto.subtle.deriveKey(
    algo,
    await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: algo.name },
      false,
      ['deriveKey']
    ),
    ALGORITHM,
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(
  text: string,
  password: string
): Promise<Encrypted> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { ...ALGORITHM, iv },
    await deriveKey(password),
    new TextEncoder().encode(text)
  );

  return { cipher, iv };
}

export async function decrypt(
  { cipher, iv }: Encrypted,
  password: string
): Promise<string> {
  return new TextDecoder().decode(
    await crypto.subtle.decrypt(
      { ...ALGORITHM, iv },
      await deriveKey(password),
      cipher
    )
  );
}
