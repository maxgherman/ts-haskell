
export class NonEmpty<T> {
    private _value: T[];
    
    private constructor() {
        this._value = [];
    }

    public ':|'<R>(value: R) {
        const result = new NonEmpty();
        result._value = [...this._value, value];

        return result;
    }

    public static from<R>([value]: [R]): NonEmpty<R> {
        const result = new NonEmpty<R>();
        result._value.push(value);

        return result;
    }

    // Iterator protocol
    [Symbol.iterator]() {
        return this._value[Symbol.iterator]();       
    }
}