const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

exports.register = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await Usuario.create({ ...req.body, password: hashedPassword });
        res.redirect('/login');
    } catch (err) {
        res.status(400).send("Error al registrar: " + err.message);
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });
    
    if (usuario && await bcrypt.compare(password, usuario.password)) {
        const token = jwt.sign({ id: usuario.id, nombre: usuario.nombre }, process.env.JWT_SECRET || 'secretokey', { expiresIn: '2h' });
        res.cookie('token', token, { httpOnly: true }); // Guardamos token en cookie segura
        res.redirect('/');
    } else {
        res.render('login', { error: 'Credenciales inválidas' });
    }
};