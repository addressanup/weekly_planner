import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, UpdateProfileDto, AuthResponseDto, UserDto } from './dto';
import type { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const accessToken = await this.generateToken(user.id, user.email);

    // Create session
    await this.createSession(user.id, accessToken);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? '',
        avatarUrl: user.avatar,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Login existing user
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(
      password,
      user.password ?? '',
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate JWT token
    const accessToken = await this.generateToken(user.id, user.email);

    // Create session
    await this.createSession(user.id, accessToken);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? '',
        avatarUrl: user.avatar,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? '',
      avatarUrl: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserDto> {
    const { avatarUrl, ...rest } = updateProfileDto;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...rest,
        avatar: avatarUrl,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? '',
      avatarUrl: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Logout user (invalidate session)
   */
  async logout(userId: string, token: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        userId,
        token,
      },
    });
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  private async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT access token
   */
  private async generateToken(userId: string, email: string): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      email,
    };

    // Module is already configured with secret and expiresIn, so we don't need to pass them again
    return this.jwtService.signAsync(payload);
  }

  /**
   * Create session record
   */
  private async createSession(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await this.prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }
}
