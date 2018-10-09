import { identity } from 'ramda';
import { IApplicative, Application, Application2, Application3, applicative as appBase } from '@control/common/applicative';
import { IsWriter, WriterF, functor as functorBase } from '@control/functor/writer';
import { IMonoid } from '@control/common/monoid';
import { Writer } from '@data/writer';

export interface IWriterApplicative<TLog> extends IApplicative<IsWriter> {
    fmap: <A, B>(f: (a: A) => B, fa: WriterF<A, TLog>) => WriterF<B, TLog>
    '<$>': <A, B>(f: (a: A) => B, fa: WriterF<A, TLog>) => WriterF<B, TLog>
    '<$': <A, B>(a: A, fb: WriterF<B, TLog>) => WriterF<A, TLog>
    '$>': <A, B>(fa: WriterF<A, TLog>, b: B) => WriterF<B, TLog>
    '<&>': <A, B>(fa: WriterF<A, TLog>, f: (a: A) => B) => WriterF<A, TLog>
    
    pure<A>(a: A): WriterF<A, TLog>
    lift<A, B>(fab: WriterF<Application<A, B>, TLog>, fa: WriterF<A, TLog>): WriterF<B, TLog>;
    liftA2<A, B, C>(abc: Application2<A, B, C>, fa: WriterF<A, TLog>, fb: WriterF<B, TLog>):
        WriterF<C, TLog>;
    '*>'<A, B>(fa: WriterF<A, TLog>, fb: WriterF<B, TLog>): WriterF<B, TLog>;
    '<*'<A, B>(fa: WriterF<A, TLog>, fb: WriterF<B, TLog>): WriterF<A, TLog>;
    '<**>'<A, B>(fa: WriterF<A, TLog>, fab: WriterF<Application<A, B>, TLog>): WriterF<B, TLog>;
    liftA<A, B>(f: Application<A, B>, fa: WriterF<A, TLog>): WriterF<B, TLog>;
    liftA3<A, B, C, D>(f: Application3<A, B, C, D>, fa: WriterF<A, TLog>, fb: WriterF<B, TLog>, fc: WriterF<C, TLog>):
        WriterF<D, TLog>; 
}

// pure a = \_ -> a
const pureWithMonoid = <A, TLog>(monoid: IMonoid<TLog>) => (a: A): WriterF<A, TLog> =>
    Writer.from([a, monoid.mempty() as TLog]); 

// f <*> g = \x -> f x (g x)
const liftWithMonoid = <A, B, TLog>(monoid: IMonoid<TLog>) => (
    fab: WriterF<Application<A, B>, TLog>,
    fa: WriterF<A, TLog>): WriterF<B, TLog> => {

    fab = fab || Writer.from([identity as Application<A, B>, monoid.mempty() as TLog]);
    fa = fa || Writer.from([undefined, monoid.mempty() as TLog]);

    const [action, log1] = fab.runWriter();
    const [data, log2] = fa.runWriter();
   
    return Writer.from([action(data), monoid.mappend(log1, log2) as TLog]);
}

export const applicative = <TLog>(monoid: IMonoid<TLog>): IWriterApplicative<TLog> => {
    const functor = functorBase<TLog>(monoid);
    const pure = pureWithMonoid(monoid);
    const lift = liftWithMonoid(monoid);

    return appBase(functor, { pure, lift }) as IWriterApplicative<TLog>;
}