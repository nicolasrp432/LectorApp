
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const DIST_PATH = path.join(__dirname, 'dist');

// Middleware para servir archivos estáticos compilados con tipos MIME correctos
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

// Fallback para Single Page Application (SPA)
app.get('*', (req, res) => {
  // BLOQUEO CRÍTICO: Si la URL termina en extensiones de código fuente, devolver 404 real
  // Esto evita que el navegador intente cargar "/index.tsx"
  if (req.path.match(/\.(tsx|ts|jsx|map)$/)) {
    return res.status(404).send('Not Found');
  }

  // SIEMPRE servir el index.html de la carpeta 'dist' (el compilado)
  const indexPath = path.join(DIST_PATH, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Si no existe dist/index.html, el servidor está mal configurado o no hay build
    res.status(500).send("Error de servidor: No se encontró el bundle de producción. Ejecuta 'npm run build' antes de iniciar.");
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor Lector estable en puerto ${PORT}`);
});
