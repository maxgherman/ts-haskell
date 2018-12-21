import { identity } from 'ramda';
import { Box } from '@common/types/box';
import { functor as baseFunctor, IFunctor } from '@control/common/functor';
import { Application } from '@common/types/application';
import { Reader } from '@data/reader';

export class IsReader {}

export type ReaderF<T, A> = Box<IsReader, T> & Reader<T, A>;

export interface IReaderFunctor<T> extends IFunctor<IsReader> {
    fmap: <A, B>(f: (a: A) => B, fa: ReaderF<T, A>) => ReaderF<T, B>;
    '<$>': <A, B>(f: (a: A) => B, fa: ReaderF<T, A>) => ReaderF<T, B>,
    '<$': <A, B>(a: A, fb: ReaderF<T, B>) => ReaderF<T, A>,
    '$>': <A, B>(fa: ReaderF<T, A>, b: B) => ReaderF<T, B>,
    '<&>': <A, B>(fa: ReaderF<T, A>, f: (a: A) => B) => ReaderF<T, B>
}

const fmap = <R, A, B>(f: (a: A) => B, fa: ReaderF<R, A>): ReaderF<R, B> => {
    f = f || (identity as Application<A, B>);
    fa = fa || Reader.from(identity as Application<R, A>);
    
    return fa.mapReader(f);
};

export const functor = <T>(): IReaderFunctor<T> => baseFunctor<IsReader>({ fmap }) as IReaderFunctor<T>;
