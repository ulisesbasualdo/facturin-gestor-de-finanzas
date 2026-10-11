/** Formato `YYYY-MM` con mes entre 01 y 12. */
export const YEAR_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Mes actual del servidor en formato `YYYY-MM`. */
export function currentYearMonth(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${today.getFullYear()}-${month}`;
}
