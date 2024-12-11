import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize.database.config';
import {UserInterface} from "../interface/user.interface";

interface UserCreationAttributes extends Optional<UserInterface, 'userId'> {}

class UserModel extends Model<UserInterface, UserCreationAttributes> implements UserInterface {
    public userId!: string;
    public username!: string;
    public password!: string;
    public email!: string;
    public tasksConcluded!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

UserModel.init(
    {
        userId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Name is required'
                },
                notEmpty: {
                    msg: 'Name cannot be empty'
                },
                len: {
                    args: [2, 100],
                    msg: 'Name must be between 2 and 100 characters'
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Password is required'
                },
                notEmpty: {
                    msg: 'Password cannot be empty'
                },
                len: {
                    args: [6, 64],
                    msg: 'Password must be between 2 and 100 characters'
                }
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notNull: {
                    msg: 'Email is required'
                },
                notEmpty: {
                    msg: 'Email cannot be empty'
                },
                isEmail: {
                    msg: 'Must be a valid email address'
                },
            }
        },
        tasksConcluded: {
            defaultValue: 1,
            type: DataTypes.NUMBER,
            allowNull: false
        },
    },
    {
        sequelize,
        tableName: 'userTable',
        modelName: 'UserModel',
        timestamps: true,
    }
);

export default UserModel;
