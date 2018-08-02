import { identity, compose } from 'ramda';
import { Box, functor as baseFunctor, IFunctor, Application } from '@common/types';

export class IsPlainReader {}

export type ReaderF<T1, T2> = Box<IsPlainReader, T1> & Application<T1, T2>;

export interface IPlainReaderFunctor<T> extends IFunctor<IsPlainReader> {
    fmap: <A, B>(f: (a: A) => B, fa: ReaderF<T, A>) => ReaderF<T, B>;
    '<$>': <A, B>(f: (a: A) => B, fa: ReaderF<T, A>) => ReaderF<T, B>,
    '<$': <A, B>(a: A, fb: ReaderF<T, B>) => ReaderF<T, A>,
    '$>': <A, B>(fa: ReaderF<T, A>, b: B) => ReaderF<T, B>,
    '<&>': <A, B>(fa: ReaderF<T, A>, f: (a: A) => B) => ReaderF<T, B>
}

const fmap = <R, A, B>(f: (a: A) => B, fa: ReaderF<R, A>): ReaderF<R, B> => {
    f = f || (identity as Application<A, B>);
    fa = fa || (identity as ReaderF<R, A>);
    
    return compose(f, fa);
};

export const functor = <T>(): IPlainReaderFunctor<T> => baseFunctor<IsPlainReader>({ fmap }) as IPlainReaderFunctor<T>;
