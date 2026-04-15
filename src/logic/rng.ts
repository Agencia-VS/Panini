/**
 * Generador de índice aleatorio criptográficamente seguro.
 * Usa crypto.getRandomValues para distribución uniforme sin sesgo módulo.
 */
export function secureRandomIndex(length: number): number {
  if (length <= 0) {
    throw new RangeError('secureRandomIndex: length must be > 0');
  }
  if (length === 1) return 0;

  const array = new Uint32Array(1);
  crypto.getRandomValues(array);

  // Evitar sesgo módulo: descartar valores que no son divisibles de forma uniforme
  const max = Math.floor(0x100000000 / length) * length;
  let value = array[0];
  while (value >= max) {
    crypto.getRandomValues(array);
    value = array[0];
  }

  return value % length;
}
