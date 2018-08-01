
export interface Just<T> {
    value: T;
    isJust: boolean;
    isNothing: boolean;
}

export interface Nothing {
    isJust: boolean;
    isNothing: boolean;
}

const createNothing = (): Nothing => {
    return {
        get isJust() {
            return false;
        },

        get isNothing() {
            return true;
        }
    };
} 

const createJust = <R>(value: R): Just<R> => {
    return {
        get value() {
            return value;
        },

        get isJust() {
            return true;
        },

        get isNothing() {
            return false;
        }
    };
}

export type MaybeType<T> = Just<T> | Nothing

export class Maybe {
    private constructor() {}
    
    public static from<R>(value: R | null | undefined) : MaybeType<R> {
        if(value === null || value === undefined) {
            return createNothing();      
        }

        return createJust<R>(value);
    }

    public static nothing<R>() : MaybeType<R> {
        return createNothing();      
    }

    public static just<R>(value: R) : MaybeType<R> {
        return Maybe.from<R>(value);
    }
}