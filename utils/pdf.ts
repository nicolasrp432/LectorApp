import * as pdfjsLib from 'pdfjs-dist';

// Handle ESM/CJS interop: pdfjs-dist via esm.sh often puts exports on the 'default' property
// @ts-ignore
const pdfjs = pdfjsLib.default ?? pdfjsLib;

// Configurar el worker. En un entorno de build normal usaríamos un import local,
// pero para ESM/CDN usamos la URL absoluta compatible.
if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

export const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // Use the resolved pdfjs object
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const numPages = pdf.numPages;

    // Limitamos a 20 páginas para evitar bloquear el navegador en este MVP
    // y no exceder límites de tokens de IA fácilmente.
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
        fullText += `\n\n[Texto truncado. Se procesaron las primeras ${maxPages} páginas del documento...]`;
    }

    return fullText;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("No se pudo leer el archivo PDF.");
  }
};