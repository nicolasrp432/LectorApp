
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const DIST_PATH = path.join(__dirname, 'dist');

console.log(`Verificando directorio de activos en: ${DIST_PATH}`);
if (fs.existsSync(DIST_PATH)) {
    console.log("Directorio 'dist' detectado correctamente.");
} else {
    console.warn("ADVERTENCIA: Directorio 'dist' no encontrado. Asegúrate de ejecutar 'npm run build' primero.");
}

// Servir archivos estáticos primero (prioridad alta)
app.use(express.static(DIST_PATH));

app.get('/health', (req, res) => res.status(200).send('OK'));

// Solo aplicar el fallback de index.html para rutas que NO parecen ser archivos
// Esto evita que las peticiones a archivos inexistentes devuelvan el HTML
app.get('*', (req, res) => {
  // Si la ruta contiene un punto, probablemente sea un archivo (JS, CSS, IMG, etc.)
  // Si no existe, devolvemos 404 real en lugar de index.html
  if (req.path.includes('.')) {
      return res.status(404).send('Archivo no encontrado');
  }

  const indexPath = path.join(DIST_PATH, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Aplicación no lista. Verifica el build.");
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de Lector escuchando en 0.0.0.0:${PORT}`);
});
