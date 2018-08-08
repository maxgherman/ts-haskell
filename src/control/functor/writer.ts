import { identity } from 'ramda';
import { Box, functor as baseFunctor, IFunctor, Application } from '@common/types';
import { Writer } from '@data/writer';

export class IsWriter {}

export type WriterF<T, A> = Box<IsWriter, T> & Writer<T, A>;

export interface IWriterFunctor<T> extends IFunctor<IsWriter> {
    fmap: <A, B>(f: (a: A) => B, fa: WriterF<T, A>) => WriterF<T, B>;
    '<$>': <A, B>(f: (a: A) => B, fa: WriterF<T, A>) => WriterF<T, B>,
    '<$': <A, B>(a: A, fb: WriterF<T, B>) => WriterF<T, A>,
    '$>': <A, B>(fa: WriterF<T, A>, b: B) => WriterF<T, B>,
    '<&>': <A, B>(fa: WriterF<T, A>, f: (a: A) => B) => WriterF<T, B>
}

const fmap = <R, A, B>(f: (a: A) => B, fa: WriterF<R, A>): WriterF<R, B> => {
    f = f || (identity as Application<A, B>);
    fa = fa || Writer.from([undefined, undefined]);
    
    const value = fa.runWriter();
    return Writer.from([f(value[0]), value[1]]);
};

export const functor = <T>(): IWriterFunctor<T> => baseFunctor<IsWriter>({ fmap }) as IWriterFunctor<T>;