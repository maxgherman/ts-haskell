export class BoxedArray<T> {
    private constructor(private _value: T[] | null | undefined) {
        this._value = _value || []
    }

    public static from<T>(value: T[]) {
        return new BoxedArray<T>(value)
    }

    public static empty<T>() {
        return new BoxedArray<T>(undefined)
    }

    public get value(): T[] {
        return this._value
    }

    // Iterator protocol
    [Symbol.iterator]() {
        return this._value[Symbol.iterator]()
    }
}