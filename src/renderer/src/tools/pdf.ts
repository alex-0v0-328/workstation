import PDFMerger from 'pdf-merger-js/browser'

// Thin glue over pdf-merger-js (which wraps pdf-lib). pages uses its syntax, e.g. "1-3, 5"; empty keeps every page.
export interface PdfPart { data: Uint8Array | ArrayBuffer; pages?: string }
export class PdfPartError extends Error { constructor(readonly index: number, cause: unknown) { super(cause instanceof Error ? cause.message : String(cause)) } }

export async function mergePdfs(parts: PdfPart[]): Promise<Uint8Array> {
  const merger = new PDFMerger()
  for (const [index, part] of parts.entries()) {
    try { await merger.add(part.data, part.pages?.trim() || null) } catch (e) { throw new PdfPartError(index, e) }
  }
  await merger.setMetadata({ producer: 'Workstation', creator: 'Workstation' })
  return merger.saveAsBuffer()
}
