class Property {
    public readonly Name: string;
    public readonly Type: Type;

    public constructor(name: string, type: Type) {
        this.Name = name;
        this.Type = type;
    }
}

class Type {
    private mName: string;

    private constructor(name: string, properties: Property[]) {
        this.mName = name;
    }

    public get Name(): string {
        return this.mName;
    }

    public get Properties(): { Name: string, Type: Type }[] {
        throw new Error('not implement');
    }

    // 参数类型先不做
    public get Methods(): { Name: string, ReturnType: Type, Paras: [string] }[] {
        throw new Error('not implement');
    }
}

class TypeManager {
    public FindTypeByName(): Type {
        throw new Error('not implement');
    }
}