
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const DIST_PATH = path.join(__dirname, 'dist');

// Middleware para servir archivos estáticos con tipos MIME correctos
app.use(express.static(DIST_PATH, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

app.get('/health', (req, res) => res.status(200).send('OK'));

// Fallback para SPA: solo si no es un archivo estático
app.get('*', (req, res) => {
  // Si la petición pide un archivo .tsx o .ts directamente, es un error de configuración del cliente
  // Respondemos 404 para evitar que cargue el index.html y genere errores de tipo MIME
  if (req.path.match(/\.(tsx|ts|jsx)$/)) {
      return res.status(404).send('Source file not served in production');
  }

  const indexPath = path.join(DIST_PATH, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("App not built. Run npm run build.");
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Lector Server running on port ${PORT}`);
});
