import {UserRoles} from "../shared/utils/enums/roles";
import HttpCodes from "http-status-codes";

export class PermissionService {
    public static checkPermissionToUpdate<T extends { userId: string }>(
        resourceOwnerId: string,
        resourceOwner: T | null,
        currentUserId: string,
        allowedRoles: UserRoles[] = [UserRoles.Admin, UserRoles.Manager],
        resourceName: string = 'this resource'
    ): { status: number, message: { message: string } } | null {
        if (
            resourceOwnerId !== currentUserId &&
            currentUserId !== resourceOwner?.userId &&
            !allowedRoles.includes(currentUserId as unknown as UserRoles)
        ) {
            return {
                status: HttpCodes.FORBIDDEN,
                message: { message: `You do not have permission to update ${resourceName}` }
            };
        }
        return null;
    }
}