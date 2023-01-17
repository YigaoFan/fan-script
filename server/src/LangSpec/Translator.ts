import { Option } from "../combinator";
import { log } from "../util";

interface IUnit {
    getGenerator(): Generator<Option<string>>;
    genIdName(): string;
    toString(): string;
}

export type Unit = IUnit | string;

class Or implements IUnit {
    public Option1: string;
    public Option2: string;

    public constructor(option1: string, option2: string) {
        this.Option1 = option1;
        this.Option2 = option2;
    }

    public genIdName(): string {
        return `${this.Option1}Or${this.Option2}`;
    }

    public *getGenerator(): Generator<Option<string>> {
        yield new Option(this.Option1);
        yield new Option(this.Option2);
    }

    public toString(): string {
        return `or(${this.Option1}, ${this.Option2})`;
    }
}

// 还可能无限嵌套，瞬间感觉复杂
export const or = function (option1: string, option2: string): Or {
    return new Or(option1, option2);
};

export type Rule<Key> = [Key, { [key: string]: Unit[] } & { main: Unit[] }] | [Key, Unit[]];
export type GeneratedRule = [string, string[]];
//局部规则翻译的时候也要注意改引用处和生成的规则名一致

const getGenerator = function*(unit: Unit): Generator<Option<string>> {
    if (typeof unit == 'string') {
        yield new Option(unit);
    } else {
        yield* unit.getGenerator();
    }
};

export const genIdName = function (unit: Unit): string {
    if (typeof unit == 'string') {
        return unit;
    } else {
        return unit.genIdName();
    }
};

export const toString = function (unit: Unit): string {
    if (typeof unit == 'string') {
        return unit;
    } else {
        return unit.toString();
    }
};

export const translate = function<Key extends string>(rule: Rule<Key>): GeneratedRule[] {
    // log('translate', rule);
    if ('main' in rule[1]) {
        const globalizedRule: [string, Unit[]][] = [];
        const name: string = rule[0] as any;
        const right = rule[1] as { [key: string]: Unit[] } & { main: Unit[] };
        const localNameMap: Record<string, string> = {};
        for (const k in right) {
            if (k == 'main') {
                globalizedRule.push([name, right[k]]);
                continue;
            }
            // rename not-main rule's key to global name
            const globalName = `${name}.${k}`;
            localNameMap[k] = globalName;
            globalizedRule.push([globalName, right[k]]);
        }

        // replace local reference to global name
        for (const r of globalizedRule) {
            const units = r[1];
            for (let i = 0; i < units.length; i++) {
                const u = units[i];
                if (typeof u == 'string') {
                    if (u in localNameMap) {
                        units[i] = localNameMap[u];
                    }
                } else if (u instanceof Or) {
                    const or = u as Or;
                    if (or.Option1 in localNameMap) {
                        or.Option1 = localNameMap[or.Option1];
                    }
                    if (or.Option2 in localNameMap) {
                        or.Option2 = localNameMap[or.Option2];
                    }
                } else {
                    throw new Error(`not handle for ${u}`);
                }
            }
        }
        return globalizedRule.map(translate).flat();
    } else {
        const units = rule[1] as Unit[];
        const rs: GeneratedRule[1][] = [];
        const permut = function (i: number, previous: GeneratedRule[1]) {
            if (i < units.length) {
                const g = getGenerator(units[i]);
                for (const x of g) {
                    let current: GeneratedRule[1] = [...previous];
                    if (x.hasValue()) {
                        current.push(x.value);
                    }
                    permut(i+1, current);
                }
            } else {
                rs.push(previous);
            }
        };
        permut(0, []);
        return rs.map(x => [rule[0] as string, x]);
    }
};
