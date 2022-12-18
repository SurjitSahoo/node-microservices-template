import sql from 'sequelize-config';
import { BREED } from '../constants/dog';

/**
 * `sql.sequelize` (sequelize instance) needs to be defined before we can define our models.
 * So wrap your model definitions in a function and return the model from the function
 * This function will be called while initializing sequelize, right after the sequelize instance creation
 *
 * NOTE: Always use default export for model-definer function, and the name of the function doesn't matter
 * NOTE: Do not define the associations in model files, define them in associations/index.js file
 */

export default function modelDefiner() {
  const Dog = sql.sequelize.define(
    'Dog',
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
      color: {
        type: sql.DataTypes.STRING,
        allowNull: false,
      },
      breed: {
        type: sql.DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: Object.values(BREED),
        },
      },
    },
    {
      timestamps: true,
      paranoid: true,
    },
  );

  return Dog;
}
