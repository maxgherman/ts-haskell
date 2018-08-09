import { identity } from 'ramda';
import { Box, functor as baseFunctor, IFunctor } from '@common/types/functor';
import { Either } from '@data/either';

export class IsEither {}

export type EitherF<T1, T2> = Box<IsEither, T1> & Either<T1, T2>

export interface IEitherFunctor<T> extends IFunctor<IsEither> {
    fmap: <A, B>(f: (a: A) => B, fa: EitherF<T, A>) => EitherF<T, B>;
    '<$>': <A, B>(f: (a: A) => B, fa: EitherF<T, A>) => EitherF<T, B>,
    '<$': <A, B>(a: A, fb: EitherF<T, B>) => EitherF<T, A>,
    '$>': <A, B>(fa: EitherF<T, A>, b: B) => EitherF<T, B>,
    '<&>': <A, B>(fa: EitherF<T, A>, f: (a: A) => B) => EitherF<T, B>
}

const fmap = <R, A, B>(f: (a: A) => B, fa: EitherF<R, A>) : EitherF<R, B> => {
    f = f || (identity as (a: A) => B);
    fa = fa || Either.right(undefined);

    return fa.isLeft ?
        Either.left(fa.value) as EitherF<R, B> :
        Either.right(f(fa.value as A)) as EitherF<R, B>;
}

export const functor = <T>(): IEitherFunctor<T> => baseFunctor<IsEither>({ fmap }) as IEitherFunctor<T>;
