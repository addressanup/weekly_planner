import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword123',
    avatar: 'https://example.com/avatar.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: null,
    googleId: null,
    lastLogin: null,
    preferences: null,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      session: {
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'Password123!',
      name: 'New User',
    };

    it('should successfully register a new user', async () => {
      bcrypt.hash.mockResolvedValue('hashedPassword' as never);
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue({
        ...mockUser,
        email: registerDto.email,
        name: registerDto.name,
      });
      prismaService.session.create.mockResolvedValue({} as any);
      jwtService.signAsync.mockResolvedValue('test-jwt-token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken', 'test-jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.name).toBe(registerDto.name);
      expect(prismaService.user.create).toHaveBeenCalled();
      expect(prismaService.session.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser as any);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    it('should hash the password before storing', async () => {
      bcrypt.hash.mockResolvedValue('hashedPassword' as never);
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue({
        ...mockUser,
        email: registerDto.email,
      });
      prismaService.session.create.mockResolvedValue({} as any);
      jwtService.signAsync.mockResolvedValue('test-jwt-token');

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            password: 'hashedPassword',
          }),
        }),
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should successfully login with valid credentials', async () => {
      bcrypt.compare.mockResolvedValue(true as never);
      prismaService.user.findUnique.mockResolvedValue(mockUser as any);
      prismaService.user.update.mockResolvedValue(mockUser as any);
      prismaService.session.create.mockResolvedValue({} as any);
      jwtService.signAsync.mockResolvedValue('test-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken', 'test-jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(mockUser.email);
      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            lastLogin: expect.any(Date),
          }),
        }),
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      bcrypt.compare.mockResolvedValue(false as never);
      prismaService.user.findUnique.mockResolvedValue(mockUser as any);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await service.getProfile(mockUser.id);

      expect(result).toHaveProperty('id', mockUser.id);
      expect(result).toHaveProperty('email', mockUser.email);
      expect(result).toHaveProperty('name', mockUser.name);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: expect.objectContaining({
          id: true,
          email: true,
          name: true,
          avatar: true,
        }),
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    const updateDto = {
      name: 'Updated Name',
      avatarUrl: 'https://example.com/new-avatar.jpg',
    };

    it('should successfully update user profile', async () => {
      const updatedUser = {
        ...mockUser,
        name: updateDto.name,
        avatar: updateDto.avatarUrl,
      };

      prismaService.user.update.mockResolvedValue(updatedUser as any);

      const result = await service.updateProfile(mockUser.id, updateDto);

      expect(result.name).toBe(updateDto.name);
      expect(result.avatarUrl).toBe(updateDto.avatarUrl);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: expect.objectContaining({
          name: updateDto.name,
          avatar: updateDto.avatarUrl,
        }),
        select: expect.any(Object),
      });
    });

    it('should update only provided fields', async () => {
      const partialUpdate = { name: 'Only Name Updated' };

      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        name: partialUpdate.name,
      } as any);

      await service.updateProfile(mockUser.id, partialUpdate);

      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: partialUpdate.name,
            avatar: undefined,
          }),
        }),
      );
    });
  });

  describe('logout', () => {
    it('should delete user session', async () => {
      const token = 'test-token';
      prismaService.session.deleteMany.mockResolvedValue({ count: 1 } as any);

      await service.logout(mockUser.id, token);

      expect(prismaService.session.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
          token,
        },
      });
    });

    it('should handle logout even if no session exists', async () => {
      const token = 'non-existent-token';
      prismaService.session.deleteMany.mockResolvedValue({ count: 0 } as any);

      await expect(service.logout(mockUser.id, token)).resolves.not.toThrow();
    });
  });
});
