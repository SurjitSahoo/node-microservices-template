/**
 * Apply associations after sequelize is initialized
 * Destructure your models in the following function, and write your associations
 */

import sql from 'sequelize-config';

export function createAssociations() {
  const { Dog, Owner } = sql.sequelize.models;

  Owner.hasMany(Dog);
  Dog.belongsTo(Owner);
}
