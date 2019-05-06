import { Box } from '@common/types/box'
import { NonEmpty } from '@data/non-empty'

export interface ISemigroupBase<F> {
    '<>'<R>(a: Box<F, R>, b: Box<F, R>): Box<F, R>
    sconcat?<R>(value: NonEmpty<R>): Box<F, R>
    stimes?<R>(b: number, a: R): Box<F, R>
}

export interface ISemigroup<F> extends ISemigroupBase<F> { }

const sconcat = <T, R>(base: ISemigroupBase<T>) =>
    (value: NonEmpty<R>): Box<T, R> => {
        const iterator = value[Symbol.iterator]()
        let next = iterator.next()
        let data = next.value as Box<T, R>

        while (!next.done) {
            next = iterator.next()
            data = base['<>'](data, next.value)
        }

        return data
    }

const stimes = <T, R>(base: ISemigroupBase<T>) =>
    (b: number, a: R) : Box<T, R> => {
        if (b <= 0) throw 'stimes: positive multiplier expected'

        if (b === 1) return a

        let result = a as Box<T, R>
        b -= 1

        while (b > 0) {
            result = base['<>'](result, a)
            b -= 1
        }

        return result
    }

export const semigroup = <T>(base: ISemigroupBase<T>): ISemigroup<T> => {

    return {
        ...base,
        sconcat: base.sconcat || sconcat(base),
        stimes: base.stimes || stimes(base)
    }
}