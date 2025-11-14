"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeekWithStatsDto = exports.WeekResponseDto = exports.DayResponseDto = void 0;
class DayResponseDto {
    id;
    date;
    theme;
    focusMetric;
    weekId;
    createdAt;
    updatedAt;
    tasks;
}
exports.DayResponseDto = DayResponseDto;
class WeekResponseDto {
    id;
    startDate;
    endDate;
    theme;
    userId;
    createdAt;
    updatedAt;
    days;
}
exports.WeekResponseDto = WeekResponseDto;
class WeekWithStatsDto extends WeekResponseDto {
    statistics;
}
exports.WeekWithStatsDto = WeekWithStatsDto;
//# sourceMappingURL=week-response.dto.js.map