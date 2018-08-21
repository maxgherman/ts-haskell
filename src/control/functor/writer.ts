import { identity } from 'ramda';
import { Box } from '@common/types/box';
import { functor as baseFunctor, IFunctor } from '@common/types/functor';
import { IMonoid } from '@common/types/monoid';
import { Application } from '@common/types/applicative';
import { Writer } from '@data/writer';

export class IsWriter {}

export type WriterF<T, A> = Box<IsWriter, IMonoid<T>> & Writer<IMonoid<T>, A>;

export interface IWriterFunctor<T> extends IFunctor<IsWriter> {
    fmap: <A, B>(f: (a: A) => B, fa: WriterF<T, A>) => WriterF<T, B>;
    '<$>': <A, B>(f: (a: A) => B, fa: WriterF<T, A>) => WriterF<T, B>,
    '<$': <A, B>(a: A, fb: WriterF<T, B>) => WriterF<T, A>,
    '$>': <A, B>(fa: WriterF<T, A>, b: B) => WriterF<T, B>,
    '<&>': <A, B>(fa: WriterF<T, A>, f: (a: A) => B) => WriterF<T, B>
}

const fmap = <R>(monoid: IMonoid<R>) => <A, B>(f: (a: A) => B, fa: WriterF<R, A>): WriterF<R, B> => {
    f = f || (identity as Application<A, B>);
    fa = fa || Writer.from([undefined, monoid]);
    
    const value = fa.runWriter();
    return Writer.from([f(value[0]), value[1]]);
};

export const functor = <T>(monoid: IMonoid<T>): IWriterFunctor<T> =>
    baseFunctor<IsWriter>({ fmap: fmap(monoid) }) as IWriterFunctor<T>;