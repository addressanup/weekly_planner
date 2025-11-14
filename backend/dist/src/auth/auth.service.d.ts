import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, UpdateProfileDto, AuthResponseDto, UserDto } from './dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    getProfile(userId: string): Promise<UserDto>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserDto>;
    logout(userId: string, token: string): Promise<void>;
    private hashPassword;
    private verifyPassword;
    private generateToken;
    private createSession;
}
