export declare class AuthResponseDto {
    accessToken: string;
    user: {
        id: string;
        email: string;
        name: string;
        avatarUrl: string | null;
        createdAt: Date;
    };
}
export declare class UserDto {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}
