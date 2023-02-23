import { log } from "../util";
import { Exp } from "../LangSpec/NodeDef";

export enum ArithOperator {
    Multiply = '*',
    Divide = '/',
    Remain = '%',
    Add = '+',
    Minus = '-',
}

const OperatorPriority: Record<number, ArithOperator[]> = {
    0: [ArithOperator.Add, ArithOperator.Minus],
    1: [ArithOperator.Multiply, ArithOperator.Divide, ArithOperator.Remain],
};

const BooleanOperatorPriority: Record<string, ArithOperator[]> = {
    0: [ArithOperator.Add, ArithOperator.Minus],
    1: [ArithOperator.Multiply, ArithOperator.Divide, ArithOperator.Remain],
};

const GetPriorityOf = function <Operator>(operator: Operator, priorityMap: Record<number, Operator[]>): number {
    for (const p in priorityMap) {
        // log('priority', p);
        if (priorityMap[p].includes(operator)) {
            return Number(p);
        }
    }
    throw new Error('cannot find the priority of ' + operator);
};

const SortByPriority = function <Operator>(operators: Operator[], priorityMap: Record<number, Operator[]>) {
    const orderedOperators: [Operator, number][] = [];
    for (let i = 0, lastOperatorPosition = -1; i < operators.length; i++) {
        const op = operators[i];
        if (lastOperatorPosition == -1) {
            orderedOperators.push([op, i]);
            lastOperatorPosition = 0;
            continue;
        }

        function Insert(opeartor: Operator): void {
            const p = GetPriorityOf(opeartor, priorityMap);
            for (let j = lastOperatorPosition; j < orderedOperators.length; j++) {
                if (p > GetPriorityOf(orderedOperators[j][0], priorityMap)) {
                    orderedOperators.splice(j, 0, [opeartor, i]);
                    return;
                }
            }
            orderedOperators.push([opeartor, i]);
        }
        Insert(op);
    }
    return orderedOperators;
};
// || 也有类似的运算
// 修改下 logview 类似 calculator 的算法，那个应该是有问题
export const Calculate = function <Operator extends string | number | symbol, Operand>(operators: Operator[], operands: Operand[], priorityMap: Record<number, Operator[]>, operatorFuncs: Record<Operator, (p0: Operand, p1: Operand) => Operand>): Operand {
    const operandRanges: { Left: number, Right: number }[] = operands.map((_, i) => ({ Left: i, Right: i }));
    const sortedOperators = SortByPriority(operators, priorityMap);
    for (const op of sortedOperators) {
        const left = op[1];
        const right = op[1] + 1;
        const result = operatorFuncs[op[0]](operands[left], operands[right]);
        const newLeft = operandRanges[left].Left;
        const newRight = operandRanges[right].Right;
        // set result
        operands[newLeft] = result;
        operands[newRight] = result;
        // set range
        operandRanges[newLeft].Right = newRight;
        operandRanges[newRight].Left = newLeft;
    }
    return operands[0];
};