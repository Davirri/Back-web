import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import routes from './appControllers/routes.js';
import errorHandler from './middleware/errorHandler.js'; // Importamos el middleware de manejo de errores

dotenv.config(); // Cargamos las variables de entorno

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conexión a MongoDB establecida');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err.message);
    process.exit(1); // Terminamos el proceso si no se puede conectar a MongoDB
  }
};

// Conectamos a la base de datos
connectDB();

// Rutas
app.use('/', routes);

// Middleware de manejo de errores
app.use(errorHandler);

// Configuramos el puerto del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

export default app;
