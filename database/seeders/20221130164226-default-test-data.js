/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    const timestamps = {
      createdAt: Sequelize.literal('CURRENT_TIMESTAMP'),
      updatedAt: Sequelize.literal('CURRENT_TIMESTAMP'),
    };

    await queryInterface.bulkInsert('Owners', [
      {
        id: 1,
        name: 'John Conner',
        ...timestamps,
      },
      {
        id: 2,
        name: 'Sarah Conner',
        ...timestamps,
      },
    ]);

    await queryInterface.bulkInsert('Dogs', [
      {
        id: 1,
        name: 'Ozymandias',
        color: 'brown',
        breed: 'Labrador Retriever',
        OwnerId: 1,
        ...timestamps,
      },
      {
        id: 2,
        name: 'Oz',
        color: 'black and brown',
        breed: 'German Shepherd',
        OwnerId: 1,
        ...timestamps,
      },
      {
        id: 3,
        name: 'Merovingian',
        color: 'golden',
        breed: 'Golden Retriever',
        OwnerId: 2,
        ...timestamps,
      },
    ]);
  },

  async down(queryInterface, _Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Dogs');
    await queryInterface.bulkDelete('Owners');
  },
};
