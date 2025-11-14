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
exports.CreateDayDto = void 0;
const class_validator_1 = require("class-validator");
class CreateDayDto {
    date;
    weekId;
    theme;
    focusMetric;
}
exports.CreateDayDto = CreateDayDto;
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'Date must be a valid date' }),
    __metadata("design:type", String)
], CreateDayDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDayDto.prototype, "weekId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100, { message: 'Theme must be less than 100 characters' }),
    __metadata("design:type", String)
], CreateDayDto.prototype, "theme", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200, { message: 'Focus metric must be less than 200 characters' }),
    __metadata("design:type", String)
], CreateDayDto.prototype, "focusMetric", void 0);
//# sourceMappingURL=create-day.dto.js.map