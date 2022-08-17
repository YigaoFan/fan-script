class Type {
    private constructor() {
        
    }

    public get Properties(): [{ Name: string, Type: Type }] {

    }

    // 参数类型先不做
    public get Methods(): [{ Name: string, ReturnType: Type }] {

    }
}

class TypeManager {
    public FindTypeByName(): Type {
        
    }
}