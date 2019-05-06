import { identity } from 'ramda'
import { IsReader, ReaderBox } from '@common/types/reader-box'
import { functor as baseFunctor, IFunctor } from '@control/common/functor'
import { Application } from '@common/types/application'
import { Reader } from '@data/reader'

export interface IReaderFunctor<T> extends IFunctor<IsReader> {
    fmap: <A, B>(f: (a: A) => B, fa: ReaderBox<T, A>) => ReaderBox<T, B>
    '<$>': <A, B>(f: (a: A) => B, fa: ReaderBox<T, A>) => ReaderBox<T, B>
    '<$': <A, B>(a: A, fb: ReaderBox<T, B>) => ReaderBox<T, A>
    '$>': <A, B>(fa: ReaderBox<T, A>, b: B) => ReaderBox<T, B>
    '<&>': <A, B>(fa: ReaderBox<T, A>, f: (a: A) => B) => ReaderBox<T, B>
}

const fmap = <R, A, B>(f: (a: A) => B, fa: ReaderBox<R, A>): ReaderBox<R, B> => {
    f = f || (identity as Application<A, B>)
    fa = fa || Reader.from(identity as Application<R, A>)

    return fa.mapReader(f)
}

export const functor = <T>() => baseFunctor<IsReader>({ fmap }) as IReaderFunctor<T>
