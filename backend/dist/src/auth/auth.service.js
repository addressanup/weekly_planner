"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(registerDto) {
        const { email, password, name } = registerDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await this.hashPassword(password);
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
        const accessToken = await this.generateToken(user.id, user.email);
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
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await this.verifyPassword(password, user.password ?? '');
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });
        const accessToken = await this.generateToken(user.id, user.email);
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
    async getProfile(userId) {
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
            throw new common_1.NotFoundException('User not found');
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
    async updateProfile(userId, updateProfileDto) {
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
    async logout(userId, token) {
        await this.prisma.session.deleteMany({
            where: {
                userId,
                token,
            },
        });
    }
    async hashPassword(password) {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }
    async verifyPassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
    async generateToken(userId, email) {
        const payload = {
            sub: userId,
            email,
        };
        return this.jwtService.signAsync(payload);
    }
    async createSession(userId, token) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.session.create({
            data: {
                userId,
                token,
                expiresAt,
            },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map