const MAX_PDF_CHARS = 14000;

export async function extractPdfText(file: File): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocumentProxy(bytes);
  const result = await extractText(pdf, { mergePages: true });
  const raw = Array.isArray(result.text) ? result.text.join("\n") : result.text;
  return String(raw || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function truncateDocument(text: string, limit = MAX_PDF_CHARS): string {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}\n\n[Document truncated for length.]`;
}
