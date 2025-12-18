
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

app.use(express.static(DIST_PATH));

app.get('/health', (req, res) => res.status(200).send('OK'));

app.get('*', (req, res) => {
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
