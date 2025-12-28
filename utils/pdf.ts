
import * as pdfjsLib from 'pdfjs-dist';

// Handle ESM/CJS interop
// @ts-ignore
const pdfjs = pdfjsLib.default ?? pdfjsLib;

const PDF_JS_VERSION = '4.4.168';

if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${PDF_JS_VERSION}/build/pdf.worker.min.mjs`;
}

export const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const numPages = pdf.numPages;
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
        fullText += `\n\n[Texto truncado...]`;
    }

    return fullText;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("No se pudo leer el archivo PDF.");
  }
};
