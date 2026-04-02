module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Tarjeta', {
        titulo: { type: DataTypes.STRING, allowNull: false },
        descripcion: { type: DataTypes.TEXT },
        prioridad: { 
            type: DataTypes.ENUM('Función', 'Tarea', 'Bug', 'Mejoramiento'),
            defaultValue: 'Tarea'
        },
        tag: { type: DataTypes.STRING },
        estado: { 
            type: DataTypes.ENUM('Por Hacer', 'En Curso', 'Testeando', 'Hecho'), 
            defaultValue: 'Por Hacer' 
        },
        fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        fecha_inicio: { type: DataTypes.DATE },
        fecha_fin: { type: DataTypes.DATE },
        autor: { type: DataTypes.STRING },
        responsable: { type: DataTypes.STRING }
    });
};