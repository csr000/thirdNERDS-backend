"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writelog = exports.SERVER_ERROR = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const SERVER_ERROR = (res, err) => {
    (0, exports.writelog)(err.message);
    res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).send("Server Error");
};
exports.SERVER_ERROR = SERVER_ERROR;
const writelog = (...log) => {
    const isProduction = false;
    isProduction ? null : console.log(...log);
};
exports.writelog = writelog;
//# sourceMappingURL=utils.js.map