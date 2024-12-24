import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../config/sequelize.database.config';
import {TaskInterface} from "../interface/task.interface";

interface TaskCreationAttributes extends Optional<TaskInterface, 'taskId'> {}

class TaskModel extends Model<TaskInterface, TaskCreationAttributes> implements TaskInterface {
    public taskId!: string;
    public ownerId!: string;
    public title!: string;
    public description!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

TaskModel.init(
    {
        taskId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        ownerId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        sequelize,
        tableName: 'tasks',
        modelName: 'TaskModel',
        timestamps: true,
    }
);

export default TaskModel;
