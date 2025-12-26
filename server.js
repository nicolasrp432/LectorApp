
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const DIST_PATH = path.join(__dirname, 'dist');

// Middleware para servir archivos estáticos con tipos MIME estrictos
app.use(express.static(DIST_PATH, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

app.get('/health', (req, res) => res.status(200).send('OK'));

// Fallback SPA: Redirigir todas las rutas al index.html de la carpeta DIST
app.get('*', (req, res) => {
  // Prevenir bucles de peticiones a archivos fuente
  if (req.path.match(/\.(tsx|ts|jsx|map)$/)) {
    return res.status(404).send('Not Found');
  }

  const indexPath = path.join(DIST_PATH, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Si no existe dist/index.html, el build no se ha ejecutado correctamente
    res.status(500).send("Error: El bundle de producción no fue encontrado. Verifica el proceso de build.");
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor Lector estable en puerto ${PORT}`);
});
