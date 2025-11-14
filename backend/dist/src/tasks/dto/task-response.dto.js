"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignTaskToSwimlaneDto = exports.TaskResponseDto = void 0;
class TaskResponseDto {
    id;
    title;
    category;
    energy;
    status;
    durationMinutes;
    notes;
    targetOccurrencesPerWeek;
    userId;
    dayId;
    swimlane;
    order;
    completedAt;
    createdAt;
    updatedAt;
}
exports.TaskResponseDto = TaskResponseDto;
class AssignTaskToSwimlaneDto {
    swimlane;
    dayId;
    order;
}
exports.AssignTaskToSwimlaneDto = AssignTaskToSwimlaneDto;
//# sourceMappingURL=task-response.dto.js.map