
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const DIST_PATH = path.join(__dirname, 'dist');

console.log(`[Lector Server] Iniciando en puerto ${PORT}. Serviendo desde ${DIST_PATH}`);

// Middleware para servir archivos estáticos con tipos MIME correctos
app.use(express.static(DIST_PATH, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
        if (filePath.endsWith('.css')) res.setHeader('Content-Type', 'text/css');
        if (filePath.endsWith('.tsx')) res.setHeader('Content-Type', 'application/javascript');
        if (filePath.endsWith('.ts')) res.setHeader('Content-Type', 'application/javascript');
    }
}));

app.get('/health', (req, res) => res.status(200).send('OK'));

app.get('*', (req, res) => {
  const indexPath = path.join(DIST_PATH, 'index.html');
  
  // Si la petición es por un recurso que no existe pero parece un archivo (tiene extensión), 404
  // exceptuando .html que es el ruteo de la SPA
  if (req.path.includes('.') && !req.path.endsWith('.html')) {
     const filePath = path.join(DIST_PATH, req.path);
     if (!fs.existsSync(filePath)) {
        return res.status(404).send('Not Found');
     }
  }

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`[Lector Server] Error: Archivo index.html no encontrado en ${indexPath}`);
    res.status(500).send("Error de despliegue: El bundle de producción no existe.");
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor Lector estable en puerto ${PORT}`);
});
