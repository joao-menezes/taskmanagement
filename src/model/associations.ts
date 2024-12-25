import TaskModel from './task.model';
import UserModel from './user.model';

export const setupAssociations = () => {
    TaskModel.belongsTo(UserModel, { foreignKey: 'ownerId',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE', });
    UserModel.hasMany(TaskModel, { foreignKey: 'ownerId' });
};
