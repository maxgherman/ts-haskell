import { ISemigroup } from '@common/types/semigroup';

export interface IMonoidBase<T> {
    mempty(): T;
    mappend(a: T, b: T): T;
}

export interface IMonoid<T> extends IMonoidBase<T> {
    // mconcat :: [a] -> a
    // mconcat = foldr '(<>)' mempty
    mconcat(array: [T]): T;

    // LAWS
    // x <> mempty = x
    // mempty <> x = x
    // x <> (y <> z) = (x <> y) <> z (Semigroup law)
}

const mconcat = <T>(semigroup: ISemigroup<T>, monoidBase: IMonoidBase<T>) => (array: [T]): T => {
    return (array || [] as Array<T>).reduceRight(semigroup["<>"], monoidBase.mempty());
};

export const monoid = <T>(semigroup: ISemigroup<T>, monoidBase: IMonoidBase<T>): IMonoid<T> => {
    return {
        ...monoidBase,
        mconcat: mconcat(semigroup, monoidBase)
    };
};