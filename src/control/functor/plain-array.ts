import { identity } from 'ramda';
import { Box, functor as baseFunctor, IFunctor } from '@common/types';

export class IsPlainArray {}

export type ArrayF<T> = Box<IsPlainArray, T> & Array<T>;

export interface IPlainArrayFunctor extends IFunctor<IsPlainArray> {
    fmap: <A, B>(f: (a: A) => B, fa: ArrayF<A>) => ArrayF<B>;
    '<$>': <A, B>(f: (a: A) => B, fa: ArrayF<A>) => ArrayF<B>,
    '<$': <A, B>(a: A, fb: ArrayF<B>) => ArrayF<A>,
    '$>': <A, B>(fa: ArrayF<A>, b: B) => ArrayF<B>,
    '<&>': <A, B>(fa: ArrayF<A>, f: (a: A) => B) => ArrayF<B>
}

const fmap = <A, B>(f: (a: A) => B, fa: ArrayF<A>): ArrayF<B> => {
    f = f || (identity as (a: A) => B);
    fa = fa || [];
    return fa.map(f);
};

export const functor = baseFunctor<IsPlainArray>({ fmap }) as IPlainArrayFunctor;
