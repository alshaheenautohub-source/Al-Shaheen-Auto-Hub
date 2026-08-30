import { jsPDF } from 'jspdf';
import { toJpeg } from 'html-to-image';
import { InspectionReport } from '../types/inspection';

export interface GeneratePdfOptions {
  fileName?: string;
  onProgress?: (progress: number, stage: string) => void;
}

export async function generateInspectionPdf(
  reportElementId: string,
  report: InspectionReport,
  options?: GeneratePdfOptions
): Promise<Blob> {
  const container = document.getElementById(reportElementId);
  if (!container) {
    throw new Error(`Report container #${reportElementId} not found.`);
  }

  options?.onProgress?.(10, 'Preparing print document pages...');

  // Ensure document fonts are loaded before capturing
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore font ready errors
    }
  }

  // Find all printable pages (.pdf-page)
  const pages = container.querySelectorAll<HTMLElement>('.pdf-page');
  if (pages.length === 0) {
    throw new Error('No .pdf-page elements found to render.');
  }

  // Create A4 PDF (210mm x 297mm)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = 210;
  const pdfHeight = 297;

  for (let i = 0; i < pages.length; i++) {
    const pageEl = pages[i];
    const progressPercent = Math.round(15 + ((i + 1) / pages.length) * 75);
    options?.onProgress?.(progressPercent, `Rendering Page ${i + 1} of ${pages.length}...`);

    // Render page to JPEG with high fidelity using native browser rendering (supports oklch, flex, svg)
    const imgData = await toJpeg(pageEl, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });

    if (i > 0) {
      pdf.addPage();
    }

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  }

  options?.onProgress?.(95, 'Finalizing Al Shaheen PDF Document...');

  const outputBlob = pdf.output('blob');

  options?.onProgress?.(100, 'Complete!');
  return outputBlob;
}

export function downloadPdfBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

