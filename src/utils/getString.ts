export function extractTextInParentheses(input: string): string {
   const regex = /\((.*?)\)/;
   const match = regex.exec(input);
   if (match) {
      return match[1];
   }
   return '';
}
