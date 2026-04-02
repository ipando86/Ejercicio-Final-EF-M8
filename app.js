require('dotenv').config();
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const cookieParser = require('cookie-parser');

// 1. IMPORTACIONES
const { sequelize, Usuario, Tablero, Lista, Tarjeta } = require('./models');
const authMiddleware = require('./middleware/auth');
const authController = require('./controllers/authController');

const app = express();

// 2. CONFIGURACIÓN DE HANDLEBARS
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerHelper('json', (context) => JSON.stringify(context, null, 2));

// 3. MIDDLEWARES
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// 4. RUTAS DE AUTENTICACIÓN
app.get('/login', (req, res) => res.render('login', { titulo: 'Login' }));
app.get('/register', (req, res) => res.render('register', { titulo: 'Registro' }));

app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

// 5. RUTA PRINCIPAL (DASHBOARD) - EL "CORAZÓN" DEL ERROR
app.get('/', authMiddleware, async (req, res) => {
    try {
        // Intentamos buscar el tablero del usuario
        let tablero = await Tablero.findOne({
            where: { UsuarioId: req.usuario.id },
            include: [{
                model: Lista,
                as: 'Listas',
                include: [{ model: Tarjeta, as: 'Tarjetas' }]
            }],
            order: [[{ model: Lista, as: 'Listas' }, 'id', 'ASC']]
        });

        // LÓGICA DE EMERGENCIA: Si el usuario existe pero no tiene tablero ni listas
        if (!tablero) {
            console.log("🛠 Creando tablero inicial para el usuario:", req.usuario.id);
            tablero = await Tablero.create({ 
                titulo: 'Mi Tablero', 
                UsuarioId: req.usuario.id 
            });
            
            // Creamos las 3 columnas básicas
            await Lista.bulkCreate([
                { titulo: 'Por Hacer', orden: 1, TableroId: tablero.id },
                { titulo: 'En Curso', orden: 2, TableroId: tablero.id },
                { titulo: 'Hecho', orden: 3, TableroId: tablero.id }
            ]);

            // Volvemos a buscar para traer la estructura completa
            return res.redirect('/');
        }

        res.render('home', {
            titulo: 'Dashboard',
            usuario: req.usuario,
            listas: tablero.Listas || []
        });

    } catch (err) {
        console.error("❌ ERROR CRÍTICO EN DASHBOARD:", err);
        res.status(500).send("Error interno al cargar datos: " + err.message);
    }
});

// 6. RUTAS DE TARJETAS
app.post('/api/tarjetas', authMiddleware, async (req, res) => {
    try {
        const { titulo, descripcion, prioridad, responsable } = req.body;
        
        const tablero = await Tablero.findOne({ 
            where: { UsuarioId: req.usuario.id },
            include: [{ model: Lista, as: 'Listas' }]
        });

        if (!tablero || !tablero.Listas.length) {
            return res.status(400).send("No tienes columnas para añadir tarjetas.");
        }

        await Tarjeta.create({
            titulo,
            descripcion,
            prioridad,
            responsable,
            ListaId: tablero.Listas[0].id // Por defecto a la primera columna
        });

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al crear tarjeta.");
    }
});

// API para mover tarjetas (Drag & Drop)
app.post('/api/tarjetas/mover', authMiddleware, async (req, res) => {
    try {
        const { tarjetaId, nuevaListaId } = req.body;
        await Tarjeta.update({ ListaId: nuevaListaId }, { where: { id: tarjetaId } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. ARRANQUE
const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true }).then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 KanbanPro corriendo en http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("No se pudo conectar a la DB:", err);
});