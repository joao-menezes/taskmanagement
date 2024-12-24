'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
    {
      userId: '78ada912-6faa-4776-bd13-3600c249c3d9',
      username: 'John Doe',
      email: 'jhondoe@gmail.com',
      password: '12354678',
      tasksConcluded: 0,
      role: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: 'e755876a-900e-45a2-91dd-71df5743c7c0',
      username: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: '12354678',
      tasksConcluded: 0,
      role: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
