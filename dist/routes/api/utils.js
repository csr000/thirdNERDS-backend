"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareMCQs = void 0;
const utils_1 = require("../../utils");
function compareMCQs(incomingMCQs, existingMCQs) {
    let score = 0;
    for (let i = 0; i < existingMCQs.length; i++) {
        const existingMCQ = existingMCQs[i];
        const incomingMCQ = incomingMCQs.find((m) => m.question === existingMCQ.question);
        if (incomingMCQ && incomingMCQ.answer === existingMCQ.answer) {
            score++;
            incomingMCQs[i].incorrect = false;
        }
        else {
            incomingMCQs[i].incorrect = true;
        }
    }
    (0, utils_1.writelog)(score + " / " + existingMCQs.length);
    const approved = score / existingMCQs.length == 1 ? true : false;
    return { approved, incomingMCQs };
}
exports.compareMCQs = compareMCQs;
//# sourceMappingURL=utils.js.map