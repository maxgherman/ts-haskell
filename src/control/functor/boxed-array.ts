import { identity } from 'ramda';
import { Box, functor as baseFunctor, IFunctor } from '@common/types/functor';
import { BoxedArray } from '@data/boxed-array';

export class IsBoxedArray {}

export type BoxedArrayF<T> = Box<IsBoxedArray, T> & BoxedArray<T>;

export interface IBoxedArrayFunctor extends IFunctor<IsBoxedArray> {
    fmap: <A, B>(f: (a: A) => B, fa: BoxedArrayF<A>) => BoxedArrayF<B>;
    '<$>': <A, B>(f: (a: A) => B, fa: BoxedArrayF<A>) => BoxedArrayF<B>,
    '<$': <A, B>(a: A, fb: BoxedArrayF<B>) => BoxedArrayF<A>,
    '$>': <A, B>(fa: BoxedArrayF<A>, b: B) => BoxedArrayF<B>,
    '<&>': <A, B>(fa: BoxedArrayF<A>, f: (a: A) => B) => BoxedArrayF<B>
}

const fmap = <A, B>(f: (a: A) => B, fa: BoxedArrayF<A>): BoxedArrayF<B> => {
    f = f || (identity as (a: A) => B);
    fa = fa || BoxedArray.from([]);
    return BoxedArray.from(fa.value.map(f));
}

export const functor = baseFunctor<IsBoxedArray>({ fmap }) as IBoxedArrayFunctor;