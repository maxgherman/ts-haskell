import { ISemigroup } from '@common/types/semigroup';

export interface IMonoidBase<T> {
    mempty(): T;
    mappend(a: T, b: T): T;
}

export interface IMonoid<T> extends IMonoidBase<T> {
    // NOTE: This method is redundant and has the default implementation mappend = '(<>)' since base-4.11.0.0.
    // mconcat :: [a] -> a
    // mconcat = foldr '(<>)' mempty
    mconcat(array: [T]): T;

    // LAWS
    // x <> mempty = x
    // mempty <> x = x
    // x <> (y <> z) = (x <> y) <> z (Semigroup law)
}

const mconcat = <T>(semigroup: ISemigroup<T>, monoidBase: IMonoidBase<T>) => (array: [T]): T => {
    return (array || [] as [T]).reduceRight(semigroup["<>"], monoidBase.mempty());
};

export const monoid = <T>(semigroup: ISemigroup<T>, monoidBase: IMonoidBase<T>): IMonoid<T> => {
    return {
        ...monoidBase,
        mconcat: mconcat(semigroup, monoidBase)
    };
};