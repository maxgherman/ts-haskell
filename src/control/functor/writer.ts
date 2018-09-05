import { identity } from 'ramda';
import { Box } from '@common/types/box';
import { functor as baseFunctor, IFunctor } from '@common/types/functor';
import { IMonoid } from '@common/types/monoid';
import { Application } from '@common/types/applicative';
import { Writer } from '@data/writer';

export class IsWriter {}

// Writer<T, A> ==> [A, T]
// Writer<T1, T2> 
// Write <Int, Box<IsArray, String>>

export type WriterF<T, T1, TLog, A> = Box<IsWriter, T> & Writer<Box<T1, TLog>, A>

interface IWriterFunctor<T, T1, TLog> extends IFunctor<IsWriter> {
    fmap: <A, B>(f: (a: A) => B, fa: WriterF<T, T1, TLog, A>) => WriterF<T, T1, TLog, B>;
    '<$>': <A, B>(f: (a: A) => B, fa: WriterF<T, T1, TLog, A>) => WriterF<T, T1, TLog, B>,
    '<$': <A, B>(a: A, fb: WriterF<T, T1, TLog, B>) => WriterF<T, T1, TLog, A>,
    '$>': <A, B>(fa: WriterF<T, T1, TLog, A>, b: B) => WriterF<T, T1, TLog, B>,
    '<&>': <A, B>(fa: WriterF<T, T1, TLog, A>, f: (a: A) => B) => WriterF<T, T1, TLog, A>
}

// export type WriterF<T, A> = Box<IsWriter, IMonoid<T>> & Writer<IMonoid<T>, A>;

// export interface IWriterFunctor<T> extends IFunctor<IsWriter> {
//     fmap: <A, B>(f: (a: A) => B, fa: WriterF<T, A>) => WriterF<T, B>;
//     '<$>': <A, B>(f: (a: A) => B, fa: WriterF<T, A>) => WriterF<T, B>,
//     '<$': <A, B>(a: A, fb: WriterF<T, B>) => WriterF<T, A>,
//     '$>': <A, B>(fa: WriterF<T, A>, b: B) => WriterF<T, B>,
//     '<&>': <A, B>(fa: WriterF<T, A>, f: (a: A) => B) => WriterF<T, B>
// }

const fmap = <T, T1, TLog, A, B>(monoid: IMonoid<T1>) =>
    (f: (a: A) => B, fa: WriterF<T, T1, TLog, A>): WriterF<T, T1, TLog, B> => {

    f = f || (identity as Application<A, B>);
    fa = fa || Writer.from<Box<T1, TLog>, A>([undefined as A, monoid.mempty()]);

    const [data, log] = fa.runWriter();
    return Writer.from([f(data), log]);
}

export const functor = <T, T1, TLog>(monoid: IMonoid<T1>): IWriterFunctor<T, T1, TLog> =>
    baseFunctor<IsWriter>({ fmap: fmap(monoid) }) as IWriterFunctor<T, T1, TLog>;