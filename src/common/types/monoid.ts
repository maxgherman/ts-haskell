import { Box } from '@common/types/box';
import { ISemigroup } from '@common/types/semigroup';

// LAWS

// x <> mempty = x
// mempty <> x = x
// x <> (y <> z) = (x <> y) <> z (Semigroup law)
// mconcat = foldr '(<>)' mempty

export interface IMonoidBase<F> {
    mempty<A>(): Box<F, A>;
    mconcat<A>(array: Array<Box<F, A>>): Box<F, A>;
}

export interface IMonoid<F> extends IMonoidBase<F> {
    mappend<A>(a: Box<F, A>, b: Box<F, A>): Box<F, A>;
}

const mappend = <R, A>(semigroup: ISemigroup<R>) =>  (a: Box<R, A>, b: Box<R, A>): Box<R, A> => {
    return semigroup["<>"](a, b);
}

export const monoid = <T>(semigroup: ISemigroup<T>, monoidBase: IMonoidBase<T>): IMonoid<T> => {
    return {
        ...monoidBase,
        mappend: mappend(semigroup)
    };
};