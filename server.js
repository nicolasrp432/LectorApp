
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
  // BLOQUEO CRÍTICO: Evitar que el navegador pida archivos de código fuente en producción
  if (req.path.match(/\.(tsx|ts|jsx|map)$/)) {
    return res.status(404).send('Not Found');
  }

  // SIEMPRE servir el index.html que está DENTRO de la carpeta 'dist'
  const indexPath = path.join(DIST_PATH, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Si no existe dist/index.html, el proceso de build falló o no se ejecutó
    res.status(500).send("Error de despliegue: El bundle de producción no existe. Ejecuta 'npm run build'.");
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de Producción Lector activo en puerto ${PORT}`);
});
