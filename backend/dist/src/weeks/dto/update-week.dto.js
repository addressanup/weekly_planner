"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWeekDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_week_dto_1 = require("./create-week.dto");
class UpdateWeekDto extends (0, mapped_types_1.PartialType)(create_week_dto_1.CreateWeekDto) {
}
exports.UpdateWeekDto = UpdateWeekDto;
//# sourceMappingURL=update-week.dto.js.map