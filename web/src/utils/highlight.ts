function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Entoure les occurrences de `query` dans `text` par une balise <mark> */
export function highlight(text: string, query: string): string {
  if (!query.trim()) return text;
  return text.replace(new RegExp(escapeRegExp(query.trim()), 'gi'), (match) => `<mark>${match}</mark>`);
}
