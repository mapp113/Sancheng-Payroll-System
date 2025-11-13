export function dateSlashToHyphen(dateStr: string): string {
  return dateStr.replace(/\//g, '-');
}