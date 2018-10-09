import { identity } from 'ramda';
import { functor as baseFunctor, IFunctor } from '@common/types/functor';
import { BoxedArray } from '@data/boxed-array';
import { IsBoxedArray, BoxedArrayBox } from '@control/boxed-array';

export interface IBoxedArrayFunctor extends IFunctor<IsBoxedArray> {
    fmap: <A, B>(f: (a: A) => B, fa: BoxedArrayBox<A>) => BoxedArrayBox<B>;
    '<$>': <A, B>(f: (a: A) => B, fa: BoxedArrayBox<A>) => BoxedArrayBox<B>,
    '<$': <A, B>(a: A, fb: BoxedArrayBox<B>) => BoxedArrayBox<A>,
    '$>': <A, B>(fa: BoxedArrayBox<A>, b: B) => BoxedArrayBox<B>,
    '<&>': <A, B>(fa: BoxedArrayBox<A>, f: (a: A) => B) => BoxedArrayBox<B>
}

const fmap = <A, B>(f: (a: A) => B, fa: BoxedArrayBox<A>): BoxedArrayBox<B> => {
    f = f || (identity as (a: A) => B);
    fa = fa || BoxedArray.from([]);
    return BoxedArray.from(fa.value.map(f));
}

export const functor = baseFunctor<IsBoxedArray>({ fmap }) as IBoxedArrayFunctor;