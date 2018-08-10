
export interface IWriter<T, A> {
    runWriter(): [A, T];
    execWriter();
    mapWriter<B, T2>(action: (_: [A, T]) => [B, T2]): Writer<T2, B>;
}

export class Writer<T, A> implements IWriter<T, A> {
    private _value: [A, T];
    
    private constructor(value: [A, T]) {
        this._value = value;
    }

    public static from<T, A>(value: [A, T]): Writer<T, A> {
        return new Writer(value);
    }

    public runWriter(): [A, T] {
        return this._value;
    }

    public execWriter(): T {
        return this.runWriter()[1];
    }

    // mapWriter :: ((a, w) -> (b, w')) -> Writer w a -> Writer w' b
    public mapWriter<B, T2>(action: (_: [A, T]) => [B, T2]): Writer<T2, B> {
        return Writer.from(action(this.runWriter()));
    }
}