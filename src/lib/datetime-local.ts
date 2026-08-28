/** Valor de `<input type="datetime-local">` no fuso local (sem converter para UTC). */
export function toLocalDatetimeValue(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}
