import sql from 'sequelize-config';

export default function modelDefiner() {
  const Owner = sql.sequelize.define(
    'Owner',
    {
      id: {
        type: sql.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: sql.DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    },
  );

  return Owner;
}
