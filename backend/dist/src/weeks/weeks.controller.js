"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeeksController = void 0;
const common_1 = require("@nestjs/common");
const weeks_service_1 = require("./weeks.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let WeeksController = class WeeksController {
    weeksService;
    constructor(weeksService) {
        this.weeksService = weeksService;
    }
    async create(req, createWeekDto) {
        return this.weeksService.create(req.user.id, createWeekDto);
    }
    async findAll(req, startDate, endDate) {
        if (startDate && endDate) {
            return this.weeksService.findByDateRange(req.user.id, startDate, endDate);
        }
        return this.weeksService.findAll(req.user.id);
    }
    async findCurrent(req) {
        return this.weeksService.findCurrent(req.user.id);
    }
    async findOne(req, id) {
        return this.weeksService.findOne(req.user.id, id);
    }
    async findOneWithStats(req, id) {
        return this.weeksService.findOneWithStats(req.user.id, id);
    }
    async update(req, id, updateWeekDto) {
        return this.weeksService.update(req.user.id, id, updateWeekDto);
    }
    async remove(req, id) {
        await this.weeksService.remove(req.user.id, id);
    }
    async findDay(req, dayId) {
        return this.weeksService.findDay(req.user.id, dayId);
    }
    async updateDay(req, dayId, updateDayDto) {
        return this.weeksService.updateDay(req.user.id, dayId, updateDayDto);
    }
};
exports.WeeksController = WeeksController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateWeekDto]),
    __metadata("design:returntype", Promise)
], WeeksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WeeksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('current'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WeeksController.prototype, "findCurrent", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WeeksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WeeksController.prototype, "findOneWithStats", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateWeekDto]),
    __metadata("design:returntype", Promise)
], WeeksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WeeksController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('days/:dayId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('dayId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WeeksController.prototype, "findDay", null);
__decorate([
    (0, common_1.Patch)('days/:dayId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('dayId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, dto_1.UpdateDayDto]),
    __metadata("design:returntype", Promise)
], WeeksController.prototype, "updateDay", null);
exports.WeeksController = WeeksController = __decorate([
    (0, common_1.Controller)('weeks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [weeks_service_1.WeeksService])
], WeeksController);
//# sourceMappingURL=weeks.controller.js.map