const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Configuración de la conexión usando variables de entorno
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false,
        port: process.env.DB_PORT || 5432
    }
);

// Importación de definiciones de modelos
const UsuarioModel = require('./Usuario');
const TableroModel = require('./Tablero');
const ListaModel = require('./Lista');
const TarjetaModel = require('./Tarjeta');

// Inicialización de modelos
const Usuario = UsuarioModel(sequelize, DataTypes);
const Tablero = TableroModel(sequelize, DataTypes);
const Lista = ListaModel(sequelize, DataTypes);
const Tarjeta = TarjetaModel(sequelize, DataTypes);

// --- DEFINICIÓN DE RELACIONES (Crucial para el Kanban) ---

// Usuario <-> Tablero
Usuario.hasMany(Tablero, { foreignKey: 'UsuarioId' });
Tablero.belongsTo(Usuario, { foreignKey: 'UsuarioId' });

// Tablero <-> Lista
Tablero.hasMany(Lista, { as: 'Listas', foreignKey: 'TableroId' });
Lista.belongsTo(Tablero, { foreignKey: 'TableroId' });

// Lista <-> Tarjeta
Lista.hasMany(Tarjeta, { as: 'Tarjetas', foreignKey: 'ListaId' });
Tarjeta.belongsTo(Lista, { foreignKey: 'ListaId' });

module.exports = {
    sequelize,
    Usuario,
    Tablero,
    Lista,
    Tarjeta
};