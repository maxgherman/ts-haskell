
export class Either<TLeft, TRight> {
    private _leftValue: TLeft
    private _rightValue: TRight

    private _isLeft: boolean
    private _isRight: boolean

    private constructor() { }

    public static left<TLeft, TRight>(value: TLeft): Either<TLeft, TRight> {
        const result = new Either<TLeft, TRight>()
        result._leftValue = value
        result._isLeft = true
        result._isRight = false
        return result
    }

    public static right<TLeft, TRight>(value: TRight): Either<TLeft, TRight> {
        const result = new Either<TLeft, TRight>()
        result._rightValue = value
        result._isLeft = false
        result._isRight = true
        return result
    }

    public get isLeft() : boolean {
        return this._isLeft
    }

    public get isRight() : boolean {
        return this._isRight
    }

    public get value() : TLeft | TRight {
        return this._isLeft ? this._leftValue : this._rightValue
    }
}
