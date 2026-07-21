const UG_YEAR_PATTERN = /(?:^|[._-])ug(\d{2})/i;
const PG_YEAR_PATTERN = /(?:^|[._-])pg(\d{2})/i;

export function deriveGraduationYearFromEmail(email: string | null | undefined): string | null {
  const emailStr = String(email || "");
  const ugMatch = emailStr.match(UG_YEAR_PATTERN);
  if (ugMatch) {
    return String(2004 + parseInt(ugMatch[1], 10));
  }
  const pgMatch = emailStr.match(PG_YEAR_PATTERN);
  if (pgMatch) {
    return String(2002 + parseInt(pgMatch[1], 10));
  }
  return null;
}
