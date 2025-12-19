
import * as pdfjsLib from 'pdfjs-dist';

// Handle ESM/CJS interop: pdfjs-dist via esm.sh often puts exports on the 'default' property
// @ts-ignore
const pdfjs = pdfjsLib.default ?? pdfjsLib;

// Sincronización de versiones para evitar el error de mismatch
const PDF_JS_VERSION = '5.4.449';

if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${PDF_JS_VERSION}/build/pdf.worker.min.js`;
}

export const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const numPages = pdf.numPages;

    // Límite de seguridad para el MVP
    const maxPages = Math.min(numPages, 20);

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        // @ts-ignore
        .map((item) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }

    if (numPages > maxPages) {
        fullText += `\n\n[Texto truncado. Se procesaron las primeras ${maxPages} páginas...]`;
    }

    return fullText;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("No se pudo leer el archivo PDF. Verifica el formato.");
  }
};
