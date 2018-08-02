import { identity, compose } from 'ramda';
import { Box, functor as baseFunctor, IFunctor, Application } from '@common/types';

export class IsReader {}

export type ReaderF<T1, T2> = Box<IsReader, T1> & Application<T1, T2>;

export interface IReaderFunctor<T> extends IFunctor<IsReader> {
    fmap: <A, B>(f: (a: A) => B, fa: ReaderF<T, A>) => ReaderF<T, B>;
    '<$>': <A, B>(f: (a: A) => B, fa: ReaderF<T, A>) => ReaderF<T, B>,
    '<$': <A, B>(a: A, fb: ReaderF<T, B>) => ReaderF<T, A>,
    '$>': <A, B>(fa: ReaderF<T, A>, b: B) => ReaderF<T, B>,
    '<&>': <A, B>(fa: ReaderF<T, A>, f: (a: A) => B) => ReaderF<T, B>
}

const fmap = <R, A, B>(f: (a: A) => B, fa: ReaderF<R, A>): ReaderF<R, B> => {
    f = f || (identity as (a: A) => B);
    fa = fa || (identity as ReaderF<R, A>);
    
    return compose(f, fa);
};

export const functor = <T>(): IReaderFunctor<T> => baseFunctor<IsReader>({ fmap }) as IReaderFunctor<T>;
