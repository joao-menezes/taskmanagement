import UserModel from "../model/user.model";
import { UserInterface } from "../interface/user.interface";

export class UserRepository {
    static async getAllUsers(): Promise<UserInterface[]> {
        return await UserModel.findAll();
    }

    static async getUserById(userId: number): Promise<UserInterface | null> {
        return await UserModel.findOne({ where: { userId } });
    }

    static async updateUser(userId: number, userData: Partial<UserInterface>): Promise<UserInterface | null> {
        const user = await UserModel.findOne({ where: { userId } });

        if (!user) return null;

        await user.update(userData);
        return user;
    }

    static async deleteUser(userId: number): Promise<boolean> {
        const deleted = await UserModel.destroy({ where: { userId } });
        return deleted > 0;
    }

    static async emailExists(email: string): Promise<boolean> {
        const user = await UserModel.findOne({ where: { email } });
        return !!user;
    }
}
