import { identity } from 'ramda';
import { Box } from '@common/types/box';
import { functor as baseFunctor, IFunctor } from '@control/common/functor';
import { IMonoid } from '@control/common/monoid';
import { Application } from '@common/types/application';
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
    fa = fa || Writer.from([undefined as A, monoid.mempty<A>()]) as  WriterF<A, TLog>;
    
    return fa.mapWriter<B, TLog>(([data, log]: [A, TLog]) => [ f(data), log ]);
}

export const functor = <TLog>(monoid: IMonoid<TLog>): IWriterFunctor<TLog> =>
    baseFunctor<IsWriter>({ fmap: fmap(monoid) }) as IWriterFunctor<TLog>;