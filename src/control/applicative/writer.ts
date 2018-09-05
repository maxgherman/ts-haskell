import { identity } from 'ramda';
import { IApplicative, Application, Application2, Application3, applicative as appBase } from '@common/types/applicative';
import { IsWriter, WriterF, functor as functorBase } from '@control/functor/writer';
import { IMonoid } from '@common/types/monoid';
import { Writer } from '@data/writer';

export interface IWriterApplicative<T, T1, TLog> extends IApplicative<IsWriter> {
    fmap: <A, B>(f: (a: A) => B, fa: WriterF<T, T1, TLog, A>) => WriterF<T, T1, TLog, B>
    '<$>': <A, B>(f: (a: A) => B, fa: WriterF<T, T1, TLog, A>) => WriterF<T, T1, TLog, B>
    '<$': <A, B>(a: A, fb: WriterF<T, T1, TLog, B>) => WriterF<T, T1, TLog, A>
    '$>': <A, B>(fa: WriterF<T, T1, TLog, A>, b: B) => WriterF<T, T1, TLog, B>
    '<&>': <A, B>(fa: WriterF<T, T1, TLog, A>, f: (a: A) => B) => WriterF<T, T1, TLog, A>
    
    pure<A>(a: A): WriterF<T, T1, TLog, A>
    lift<A, B>(fab: WriterF<T, T1, TLog, Application<A, B>>, fa: WriterF<T, T1, TLog, A>): WriterF<T, T1, TLog, B>;
    liftA2<A, B, C>(abc: Application2<A, B, C>, fa: WriterF<T, T1, TLog, A>, fb: WriterF<T, T1, TLog, B>):
        WriterF<T, T1, TLog, C>;
    '*>'<A, B, C>(fa: WriterF<T, T1, TLog, A>, fb: WriterF<T, T1, TLog, B>): WriterF<T, T1, TLog, C>;
    '<*'<A, B, C>(fa: WriterF<T, T1, TLog, A>, fb: WriterF<T, T1, TLog, B>): WriterF<T, T1, TLog, C>;
    '<**>'<A, B>(fa: WriterF<T, T1, TLog, A>, fab: WriterF<T, T1, TLog, Application<A, B>>): WriterF<T, T1, TLog, B>;
    liftA<A, B>(f: Application<A, B>, fa: WriterF<T, T1, TLog, A>): WriterF<T, T1, TLog, B>;
    liftA3<A, B, C, D>(f: Application3<A, B, C, D>, fa: WriterF<T, T1, TLog, A>, fb: WriterF<T, T1, TLog, B>, fc: WriterF<T, T1, TLog, C>):
        WriterF<T, T1, TLog, D>; 
}

// pure a = \_ -> a
const pureWithMonoid = <T, T1, TLog, A>(monoid: IMonoid<T1>) => (a: A): WriterF<T, T1, TLog, A> =>
    Writer.from([a, monoid.mempty()]); 

// f <*> g = \x -> f x (g x)
const liftWithMonoid = <T, T1, TLog, A, B>(monoid: IMonoid<T1>) => (
    fab: WriterF<T, T1, TLog, Application<A, B>>,
    fa: WriterF<T, T1, TLog, A>): WriterF<T, T1, TLog, B> => {

    fab = fab || Writer.from([identity as Application<A, B>, monoid.mempty()]);
    fa = fa || Writer.from([undefined, monoid.mempty()]);

    const [data, log1] = fa.runWriter();
    const [action, log2] = fab.runWriter();

    return Writer.from([action(data), monoid.mappend(log1, log2)]);
}

export const applicative = <T, T1, TLog>(monoid: IMonoid<T1>): IWriterApplicative<T, T1, TLog> => {
    const functor = functorBase<T, T1, TLog>(monoid);
    const pure = pureWithMonoid(monoid);
    const lift = liftWithMonoid(monoid);

    return appBase(functor, { pure, lift }) as IWriterApplicative<T, T1, TLog>;
}