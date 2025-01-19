// Importamos los módulos necesarios y modelos de la base de datos
import bcrypt from 'bcryptjs'; // Para encriptar contraseñas
import jwt from 'jsonwebtoken'; // Para generar y verificar tokens JWT
import { User, Product, News, Merch } from '../models.js'; // Modelos de datos para usuarios, productos, noticias y merch

// Controladores de usuario

// Controlador para registrar un nuevo usuario
export async function registerUser(req, res, next) {
  // Obtenemos los datos del cuerpo de la solicitud
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    // Validamos que todos los datos requeridos estén presentes
    return res.status(400).json({ error: 'Faltan datos para registrar el usuario.' });
  }

  try {
    // Encriptamos la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    // Creamos el usuario en la base de datos
    const user = await User.create({ username, password: hashedPassword, email });
    // Enviamos la respuesta con el usuario creado
    res.status(201).json(user);
  } catch (error) {
    console.error('Error al registrar usuario:', error.message); // Registramos errores en consola
    next(error); // Pasamos el error al manejador de errores
  }
}

// Controlador para iniciar sesión de un usuario
export async function loginUser(req, res, next) {
  const { username, password } = req.body;
  if (!username || !password) {
    // Validamos que se proporcionen credenciales
    return res.status(400).json({ error: 'Debe proporcionar un nombre de usuario y una contraseña.' });
  }

  try {
    // Buscamos al usuario en la base de datos
    const user = await User.findOne({ username });
    // Comparamos la contraseña proporcionada con la almacenada
    if (user && await bcrypt.compare(password, user.password)) {
      // Generamos un token JWT con los datos del usuario
      const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.json({ token, isAdmin: user.isAdmin }); // Enviamos el token y el rol de administrador
    } else {
      return res.status(401).json({ error: 'Credenciales incorrectas.' }); // Si las credenciales no coinciden
    }
  } catch (error) {
    console.error('Error en el inicio de sesión:', error.message);
    next(error);
  }
}

// Controladores de productos

// Controlador para obtener la lista de productos
export async function getProducts(req, res, next) {
  try {
    // Obtenemos todos los productos, incluyendo la referencia al usuario
    const products = await Product.find().populate('userId');
    res.json(products); // Enviamos los productos como respuesta
  } catch (error) {
    console.error('Error al obtener productos:', error.message);
    next(error);
  }
}

// Controlador para añadir un nuevo producto
export async function addProduct(req, res, next) {
  const { name, description, price, image } = req.body;
  if (!name || !description || !price) {
    // Validamos que los campos obligatorios estén presentes
    return res.status(400).json({ error: 'Faltan datos para añadir el producto.' });
  }

  try {
    // Convertimos el precio a un número flotante
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      return res.status(400).json({ error: 'El precio debe ser un número válido.' });
    }

    // Creamos el nuevo producto en la base de datos
    const newProduct = await Product.create({
      name,
      description,
      price: parsedPrice,
      image,
      userId: req.user.id, // Asociamos el producto al usuario que lo añadió
    });

    res.status(201).json(newProduct); // Enviamos el producto creado como respuesta
  } catch (error) {
    console.error('Error al añadir el producto:', error.message);
    next(error);
  }
}

// Controlador para actualizar un producto existente
export async function updateProduct(req, res, next) {
  const { id } = req.params; // Obtenemos el ID del producto de los parámetros de la URL
  const { name, description, price, image } = req.body;
  if (!name && !description && !price && !image) {
    return res.status(400).json({ error: 'Debes proporcionar al menos un campo para editar el producto.' });
  }

  try {
    const updateData = {}; // Creamos un objeto para los campos a actualizar
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice)) {
        return res.status(400).json({ error: 'El precio debe ser un número válido.' });
      }
      updateData.price = parsedPrice;
    }
    if (image) updateData.image = image;

    // Actualizamos el producto en la base de datos
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(updatedProduct); // Enviamos el producto actualizado como respuesta
  } catch (error) {
    console.error('Error al editar producto:', error.message);
    next(error);
  }
}

// Controlador para eliminar un producto
export async function deleteProduct(req, res, next) {
  const { id } = req.params; // Obtenemos el ID del producto de los parámetros de la URL
  try {
    const product = await Product.findByIdAndDelete(id); // Eliminamos el producto
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado exitosamente', product }); // Confirmamos la eliminación
  } catch (error) {
    console.error('Error al eliminar producto:', error.message);
    next(error);
  }
}

// Controladores de noticias y artículos de merch

// Controlador para obtener todas las noticias
export async function getNews(req, res, next) {
  try {
    // Buscamos todas las noticias en la base de datos
    const news = await News.find();
    res.json(news); // Enviamos las noticias como respuesta
  } catch (error) {
    console.error('Error al obtener noticias:', error.message); // Registramos cualquier error en consola
    next(error); // Pasamos el error al siguiente middleware o manejador
  }
}

// Controlador para obtener todos los artículos de merch
export async function getMerch(req, res, next) {
  try {
    // Buscamos todos los artículos de merch en la base de datos
    const merchItems = await Merch.find();
    res.json(merchItems); // Enviamos los artículos como respuesta
  } catch (error) {
    console.error('Error al obtener artículos de merch:', error.message);
    next(error);
  }
}

// Controlador para añadir un nuevo artículo de merch
export async function addMerch(req, res, next) {
  // Obtenemos los datos del cuerpo de la solicitud
  const { name, description, price, image } = req.body;
  if (!name || !description || !price) {
    // Validamos que los campos obligatorios estén presentes
    return res.status(400).json({ error: 'Faltan datos para añadir el artículo de merch.' });
  }

  try {
    // Convertimos el precio a un número flotante
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      return res.status(400).json({ error: 'El precio debe ser un número válido.' });
    }

    // Creamos el nuevo artículo de merch en la base de datos
    const newMerch = await Merch.create({
      name,
      description,
      price: parsedPrice,
      image,
      userId: req.user.id, // Asociamos el artículo al usuario que lo añadió
    });

    res.status(201).json(newMerch); // Enviamos el artículo creado como respuesta
  } catch (error) {
    console.error('Error al añadir el artículo de merch:', error.message);
    next(error);
  }
}

// Controlador para actualizar un artículo de merch existente
export async function updateMerch(req, res, next) {
  const { id } = req.params; // Obtenemos el ID del artículo de los parámetros de la URL
  const { name, description, price, image } = req.body;
  if (!name && !description && !price && !image) {
    // Validamos que al menos un campo esté presente para la actualización
    return res.status(400).json({ error: 'Debes proporcionar al menos un campo para editar el artículo de merch.' });
  }

  try {
    const updateData = {}; // Creamos un objeto para los campos a actualizar
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice)) {
        return res.status(400).json({ error: 'El precio debe ser un número válido.' });
      }
      updateData.price = parsedPrice;
    }
    if (image) updateData.image = image;

    // Actualizamos el artículo de merch en la base de datos
    const updatedMerch = await Merch.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedMerch) {
      // Validamos si el artículo no fue encontrado
      return res.status(404).json({ error: 'Artículo de merch no encontrado' });
    }

    res.json(updatedMerch); // Enviamos el artículo actualizado como respuesta
  } catch (error) {
    console.error('Error al editar artículo de merch:', error.message);
    next(error);
  }
}

// Controlador para eliminar un artículo de merch
export async function deleteMerch(req, res, next) {
  const { id } = req.params; // Obtenemos el ID del artículo de los parámetros de la URL
  try {
    // Eliminamos el artículo de merch de la base de datos
    const merchItem = await Merch.findByIdAndDelete(id);
    if (!merchItem) {
      // Validamos si el artículo no fue encontrado
      return res.status(404).json({ error: 'Artículo de merch no encontrado' });
    }
    res.json({ message: 'Artículo de merch eliminado exitosamente', merchItem }); // Confirmamos la eliminación
  } catch (error) {
    console.error('Error al eliminar artículo de merch:', error.message);
    next(error);
  }
}
