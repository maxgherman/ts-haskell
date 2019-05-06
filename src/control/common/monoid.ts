import { flip } from 'ramda'
import { Box } from '@common/types/box'
import { ISemigroup } from '@control/common/semigroup'

export interface IMonoidBase<F> {
    mempty<A>(): Box<F, A>
    mconcat? : <A>(array: Box<F, A>[]) => Box<F, A>
}

export interface IMonoid<F> extends IMonoidBase<F> {
    mappend<A>(a: Box<F, A>, b: Box<F, A>): Box<F, A>
    '<>'<A>(a: Box<F, A>, b: Box<F, A>): Box<F, A>
}

const mappend = <R, A>(
    semigroup: ISemigroup<R>,
    mempty: <A>() => Box<R, A>) => (a: Box<R, A>, b: Box<R, A>): Box<R, A> => {
        a = a || mempty()
        b = b || mempty()

        return semigroup['<>'](a, b)
    }

// mconcat = foldr '(<>)' mempty
const mconcat = <T, A>(semigroup: ISemigroup<A>, mempty: <A>() => Box<T, A>) =>
    (array: Box<T, A>[]): Box<T, A> => {

        // flipping the args for mappend because in Haskell foldr
        // lambda takes current element as first arg
        const mappendInstance = flip(mappend<T, A>(semigroup, mempty))
        array = array || []

        return array.reduceRight(mappendInstance, mempty())
    }

export const monoid = <T>(semigroup: ISemigroup<T>, monoidBase: IMonoidBase<T>): IMonoid<T> => {
    const base = {
        ...monoidBase
    }

    if (!base.mconcat) {
        base.mconcat = mconcat(semigroup, monoidBase.mempty)
    }

    return {
        ...semigroup,
        ...base,
        mappend: mappend(semigroup, monoidBase.mempty),
    }
}