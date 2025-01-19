const authorizeAdmin = (req, res, next) => {
  // Verificamos si el usuario tiene el rol de administrador
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Acceso denegado. Solo los administradores pueden realizar esta acción.' });
  }
  next(); // Si es admin, permitimos que continúe al siguiente middleware o ruta
};

export default authorizeAdmin;
