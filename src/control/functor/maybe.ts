import { identity } from 'ramda';
import { Box, functor as baseFunctor, IFunctor } from '@common/types';
import { Maybe, MaybeType, Just } from '@data/maybe';

export class IsMaybe {}

export type MaybeF<T> = Box<IsMaybe, T> & MaybeType<T>;

export interface IMaybeFunctor extends IFunctor<IsMaybe> {
    fmap: <A, B>(f: (a: A) => B, fa: MaybeF<A>) => MaybeF<B>;
    '<$>': <A, B>(f: (a: A) => B, fa: MaybeF<A>) => MaybeF<B>,
    '<$': <A, B>(a: A, fb: MaybeF<B>) => MaybeF<A>,
    '$>': <A, B>(fa: MaybeF<A>, b: B) => MaybeF<B>,
    '<&>': <A, B>(fa: MaybeF<A>, f: (a: A) => B) => MaybeF<B>
}

const fmap = <A, B>(f: (a: A) => B, fa: MaybeF<A>): MaybeF<B> => {
    f = f || (identity as (a: A) => B);
    fa = fa || Maybe.nothing();

    return fa.isNothing ? Maybe.nothing() : Maybe.from(f((fa as Just<A>).value)); 
}

export const functor = baseFunctor<IsMaybe>({ fmap }) as IMaybeFunctor;