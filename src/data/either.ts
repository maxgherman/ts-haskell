
export interface Left<T> {
    isLeft: boolean;
    isRight: boolean;
    value: T;
}

export interface Right<T> {
    isLeft: boolean;
    isRight: boolean;
    value: T;
}

const createLeft = <R>(value: R): Left<R> => {
    return {
        get isLeft() {
            return true;
        },

        get isRight() {
            return false;
        },

        get value() {
            return value;
        }
    } as Left<R>;
}

const createRight = <R>(value: R): Right<R> => {
    return {
        get isLeft() {
            return false;
        },

        get isRight() {
            return true;
        },

        get value() {
            return value;
        }
    } as Left<R>;
}

export type EitherType<T1, T2> = Left<T1> | Right<T2>

export class Either {
    public static left<R>(value: R): Left<R> {
        return createLeft(value);
    }

    public static right<R>(value: R): Right<R> {
        return createRight(value);
    }    
}
