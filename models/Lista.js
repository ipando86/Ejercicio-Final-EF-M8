module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Lista', {
        titulo: { type: DataTypes.STRING, allowNull: false },
        orden: { type: DataTypes.INTEGER, defaultValue: 0 }
    });
};