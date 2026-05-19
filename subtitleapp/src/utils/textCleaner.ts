export const stripHtmlTags = (text: string): string => {
  return text.replace(/<[^>]+>/g, '');
};

export const stripSubtitleFormatting = (text: string): string => {
  let cleaned = text;
  cleaned = cleaned.replace(/\{[^}]*\}/g, '');
  cleaned = cleaned.replace(/\\[a-zA-Z0-9]+(\([^)]*\))?/g, '');
  cleaned = cleaned.replace(/<[^>]+>/g, '');
  cleaned = cleaned.replace(/^\s*-\s*/gm, '');
  cleaned = cleaned.trim();
  return cleaned;
};

export const cleanWord = (word: string): string => {
  return word
    .toLowerCase()
    .replace(/[^a-z']/g, '')
    .replace(/^'+|'+$/g, '');
};

export const normalizeTimestamp = (ts: string): string => {
  return ts.replace('.', ',');
};
