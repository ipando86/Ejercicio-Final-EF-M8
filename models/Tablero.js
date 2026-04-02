module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Tablero', {
        titulo: { type: DataTypes.STRING, allowNull: false },
        descripcion: { type: DataTypes.TEXT }
    });
};