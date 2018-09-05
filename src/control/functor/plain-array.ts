import { identity } from 'ramda';
import { functor as baseFunctor, IFunctor } from '@common/types/functor';
import { IsPlainArray, ArrayBox } from '@control/plain-array';

export interface IPlainArrayFunctor extends IFunctor<IsPlainArray> {
    fmap: <A, B>(f: (a: A) => B, fa: ArrayBox<A>) => ArrayBox<B>;
    '<$>': <A, B>(f: (a: A) => B, fa: ArrayBox<A>) => ArrayBox<B>,
    '<$': <A, B>(a: A, fb: ArrayBox<B>) => ArrayBox<A>,
    '$>': <A, B>(fa: ArrayBox<A>, b: B) => ArrayBox<B>,
    '<&>': <A, B>(fa: ArrayBox<A>, f: (a: A) => B) => ArrayBox<B>
}

const fmap = <A, B>(f: (a: A) => B, fa: ArrayBox<A>): ArrayBox<B> => {
    f = f || (identity as (a: A) => B);
    fa = fa || [];
    return fa.map(f);
};

export const functor = baseFunctor<IsPlainArray>({ fmap }) as IPlainArrayFunctor;
