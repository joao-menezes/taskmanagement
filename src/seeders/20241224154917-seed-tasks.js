'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tasks', [
      {
        taskId: '05a1f83c-6481-4f94-899a-93b778705e34',
        ownerId: '78ada912-6faa-4776-bd13-3600c249c3d9',
        title: 'Do Something',
        description: 'Do Something in frontroom',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        taskId: '8ccbb20d-3de8-4659-9690-ae1d5c6d0719',
        ownerId: 'e755876a-900e-45a2-91dd-71df5743c7c0',
        title: 'Do Something',
        description: 'Do Something in backroom',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tasks', null, {});
  }
};
