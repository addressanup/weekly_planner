import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, UpdateProfileDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<import("./dto").AuthResponseDto>;
    login(loginDto: LoginDto): Promise<import("./dto").AuthResponseDto>;
    getProfile(req: any): Promise<import("./dto").UserDto>;
    updateProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<import("./dto").UserDto>;
    logout(req: any): Promise<{
        message: string;
    }>;
}
