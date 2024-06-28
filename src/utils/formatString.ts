export function stringFormat(template: string, ...args: (string | number)[]): string {
   return template.replace(/{(\d+)}/g, (match, index) =>
      typeof args[index] !== 'undefined' ? String(args[index]) : match
   );
}
