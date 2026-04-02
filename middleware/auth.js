const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Intentamos obtener el token de las cookies o del header Authorization
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).render('login', { error: 'Debes iniciar sesión para acceder.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretokey');
        req.usuario = decoded; // Guardamos los datos del usuario en la petición
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.status(403).redirect('/login');
    }
};