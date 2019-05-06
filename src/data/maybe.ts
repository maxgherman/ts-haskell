
export class Maybe<T> {
    private constructor(private _value: T | null | undefined) {
        this._value = _value
    }

    public static from<T>(value: T) {
        return new Maybe<T>(value)
    }

    public static just<T>(value: T) {
        return Maybe.from<T>(value)
    }

    public static nothing() {
        return Maybe.from(null)
    }

    public get value(): T {
        return this._value
    }

    public get isNothing(): boolean {
        return this._value === null || this._value === undefined
    }

    public get isJust(): boolean {
        return !this.isNothing
    }
}
