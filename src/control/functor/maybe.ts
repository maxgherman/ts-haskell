import { identity } from 'ramda'
import { IsMaybe, MaybeBox } from '@common/types/maybe-box'
import { functor as baseFunctor, IFunctor } from '@control/common/functor'
import { Maybe } from '@data/maybe'

export interface IMaybeFunctor extends IFunctor<IsMaybe> {
    fmap: <A, B>(f: (a: A) => B, fa: MaybeBox<A>) => MaybeBox<B>
    '<$>': <A, B>(f: (a: A) => B, fa: MaybeBox<A>) => MaybeBox<B>
    '<$': <A, B>(a: A, fb: MaybeBox<B>) => MaybeBox<A>
    '$>': <A, B>(fa: MaybeBox<A>, b: B) => MaybeBox<B>
    '<&>': <A, B>(fa: MaybeBox<A>, f: (a: A) => B) => MaybeBox<B>
}

const fmap = <A, B>(f: (a: A) => B, fa: MaybeBox<A>): MaybeBox<B> => {
    f = f || (identity as (a: A) => B)
    fa = fa || Maybe.nothing()

    return fa.isNothing ? Maybe.nothing() : Maybe.from(f(fa.value))
}

export const functor = baseFunctor<IsMaybe>({ fmap }) as IMaybeFunctor