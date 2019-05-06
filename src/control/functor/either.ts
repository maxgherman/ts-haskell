import { identity } from 'ramda'
import { IsEither, EitherBox } from '@common/types/either-box'
import { functor as baseFunctor, IFunctor } from '@control/common/functor'
import { Either } from '@data/either'

export interface IEitherFunctor<T> extends IFunctor<IsEither> {
    fmap: <A, B>(f: (a: A) => B, fa: EitherBox<T, A>) => EitherBox<T, B>
    '<$>': <A, B>(f: (a: A) => B, fa: EitherBox<T, A>) => EitherBox<T, B>
    '<$': <A, B>(a: A, fb: EitherBox<T, B>) => EitherBox<T, A>
    '$>': <A, B>(fa: EitherBox<T, A>, b: B) => EitherBox<T, B>
    '<&>': <A, B>(fa: EitherBox<T, A>, f: (a: A) => B) => EitherBox<T, B>
}

const fmap = <R, A, B>(f: (a: A) => B, fa: EitherBox<R, A>) : EitherBox<R, B> => {
    f = f || (identity as (a: A) => B)
    fa = fa || Either.right(undefined)

    return fa.isLeft ?
        Either.left(fa.value) as EitherBox<R, B> :
        Either.right(f(fa.value as A)) as EitherBox<R, B>
}

export const functor =
    <T>(): IEitherFunctor<T> => baseFunctor<IsEither>({ fmap }) as IEitherFunctor<T>
