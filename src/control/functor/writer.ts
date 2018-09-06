import { identity } from 'ramda';
import { Box } from '@common/types/box';
import { functor as baseFunctor, IFunctor } from '@common/types/functor';
import { IMonoid } from '@common/types/monoid';
import { Application } from '@common/types/applicative';
import { Writer } from '@data/writer';

export class IsWriter {}

export type WriterF<T, TLog> = Box<IsWriter, T> & Writer<TLog, T>

interface IWriterFunctor<TLog> extends IFunctor<IsWriter> {
    fmap: <A, B>(f: (a: A) => B, fa: WriterF<A, TLog>) => WriterF<B, TLog>
    '<$>': <A, B>(f: (a: A) => B, fa: WriterF<A, TLog>) => WriterF<B, TLog>
    '<$': <A, B>(a: A, fb: WriterF<B, TLog>) => WriterF<A, TLog>
    '$>': <A, B>(fa: WriterF<A, TLog>, b: B) => WriterF<B, TLog>
    '<&>': <A, B>(fa: WriterF<A, TLog>, f: (a: A) => B) => WriterF<A, TLog>
}

const fmap = <TLog, A, B>(monoid: IMonoid<TLog>) =>
    (f: (a: A) => B, fa: WriterF<A, TLog>): WriterF<B, TLog> => {

    f = f || (identity as Application<A, B>);
    fa = fa || Writer.from<TLog, A>([undefined as A, monoid.mempty() as TLog]);

    const [data, log] = fa.runWriter();
    return Writer.from([f(data), log]);
}

export const functor = <TLog>(monoid: IMonoid<TLog>): IWriterFunctor<TLog> =>
    baseFunctor<IsWriter>({ fmap: fmap(monoid) }) as IWriterFunctor<TLog>;