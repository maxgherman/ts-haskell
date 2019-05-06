import { identity } from 'ramda'
import { IsWriter, WriterBox } from '@common/types/writer-box'
import { functor as baseFunctor, IFunctor } from '@control/common/functor'
import { IMonoid } from '@control/common/monoid'
import { Application } from '@common/types/application'
import { Writer } from '@data/writer'

interface IWriterFunctor<TLog> extends IFunctor<IsWriter> {
    fmap: <A, B>(f: (a: A) => B, fa: WriterBox<TLog, A>) => WriterBox<TLog, B>
    '<$>': <A, B>(f: (a: A) => B, fa: WriterBox<TLog, A>) => WriterBox<TLog, B>
    '<$': <A, B>(a: A, fb: WriterBox<TLog, B>) => WriterBox<TLog, A>
    '$>': <A, B>(fa: WriterBox<TLog, A>, b: B) => WriterBox<TLog, B>
    '<&>': <A, B>(fa: WriterBox<TLog, A>, f: (a: A) => B) => WriterBox<TLog, A>
}

const fmap = <TLog, A, B>(monoid: IMonoid<TLog>) =>
    (f: (a: A) => B, fa: WriterBox<TLog, A>): WriterBox<TLog, B> => {

        f = f || (identity as Application<A, B>)
        fa = fa || Writer.from([undefined as A, monoid.mempty<TLog>() as TLog])

        return fa.mapWriter(([data, log]) => [f(data), log])
    }

export const functor = <TLog>(monoid: IMonoid<TLog>): IWriterFunctor<TLog> =>
    baseFunctor<IsWriter>({ fmap: fmap(monoid) }) as IWriterFunctor<TLog>