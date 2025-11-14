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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTaskDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateTaskDto {
    title;
    category;
    energy;
    durationMinutes;
    notes;
    targetOccurrencesPerWeek;
    dayId;
    swimlane;
}
exports.CreateTaskDto = CreateTaskDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: 'Task title is required' }),
    (0, class_validator_1.MaxLength)(200, { message: 'Task title must be less than 200 characters' }),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.PlannerCategory, {
        message: 'Category must be one of: WORK, HEALTH, PERSONAL, LEARNING, ADMIN',
    }),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.PlannerEnergy, {
        message: 'Energy must be one of: HIGH, MEDIUM, LOW',
    }),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "energy", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'Duration must be a whole number' }),
    (0, class_validator_1.Min)(5, { message: 'Duration must be at least 5 minutes' }),
    (0, class_validator_1.Max)(480, { message: 'Duration cannot exceed 8 hours' }),
    __metadata("design:type", Number)
], CreateTaskDto.prototype, "durationMinutes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000, { message: 'Notes must be less than 1000 characters' }),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(21, { message: 'Cannot exceed 3 times per day' }),
    __metadata("design:type", Number)
], CreateTaskDto.prototype, "targetOccurrencesPerWeek", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "dayId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.SwimlaneType, {
        message: 'Swimlane must be one of: FOCUS, COLLABORATION, SELF_CARE, LIFE_ADMIN',
    }),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "swimlane", void 0);
//# sourceMappingURL=create-task.dto.js.map