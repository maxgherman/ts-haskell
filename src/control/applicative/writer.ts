import { identity } from 'ramda';
import { IsWriter, WriterBox } from '@common/types/writer-box';
import { Application, Application2, Application3 } from '@common/types/application';
import { IApplicative, applicative as appBase } from '@control/common/applicative';
import { functor as functorBase } from '@control/functor/writer';
import { IMonoid } from '@control/common/monoid';
import { Writer } from '@data/writer';

export interface IWriterApplicative<TLog> extends IApplicative<IsWriter> {
    fmap: <A, B>(f: (a: A) => B, fa: WriterBox<TLog, A>) => WriterBox<TLog, B>
    '<$>': <A, B>(f: (a: A) => B, fa: WriterBox<TLog, A>) => WriterBox<TLog, B>
    '<$': <A, B>(a: A, fb: WriterBox<TLog, B>) => WriterBox<TLog, A>
    '$>': <A, B>(fa: WriterBox<TLog, A>, b: B) => WriterBox<TLog, B>
    '<&>': <A, B>(fa: WriterBox<TLog, A>, f: (a: A) => B) => WriterBox<TLog, A>
    
    pure<A>(a: A): WriterBox<TLog, A>
    lift<A, B>(fab: WriterBox<TLog, Application<A, B>>, fa: WriterBox<TLog, A>): WriterBox<TLog, B>;
    '<*>'<A, B>(fab: WriterBox<TLog, Application<A, B>>, fa: WriterBox<TLog, A>): WriterBox<TLog, B>;
    liftA<A, B>(f: Application<A, B>, fa: WriterBox<TLog, A>): WriterBox<TLog, B>;
    liftA2<A, B, C>(abc: Application2<A, B, C>, fa: WriterBox<TLog, A>, fb: WriterBox<TLog, B>):
        WriterBox<TLog, C>;
    liftA3<A, B, C, D>(f: Application3<A, B, C, D>, fa: WriterBox<TLog, A>, fb: WriterBox<TLog, B>, fc: WriterBox<TLog, C>):
        WriterBox<TLog, D>;
    '*>'<A, B>(fa: WriterBox<TLog, A>, fb: WriterBox<TLog, B>): WriterBox<TLog, B>;
    '<*'<A, B>(fa: WriterBox<TLog, A>, fb: WriterBox<TLog, B>): WriterBox<TLog, A>;
    '<**>'<A, B>(fa: WriterBox<TLog, A>, fab: WriterBox<TLog, Application<A, B>>): WriterBox<TLog, B>;
}

// pure a = \_ -> a
const pureWithMonoid = <A, TLog>(monoid: IMonoid<TLog>) => (a: A): WriterBox<TLog, A> =>
    Writer.from([a, monoid.mempty() as TLog]); 

// f <*> g = \x -> f x (g x)
const liftWithMonoid = <A, B, TLog>(monoid: IMonoid<TLog>) => (
    fab: WriterBox<TLog, Application<A, B>>,
    fa: WriterBox<TLog, A>): WriterBox<TLog, B> => {

    fab = fab || Writer.from([ identity as Application<A, B>, monoid.mempty<TLog>() as TLog ]);
    fa = fa || Writer.from([ undefined as A, monoid.mempty<TLog>() as TLog ]);

    return fa.mapWriter(([data, log2]) => {
        
        const [action, log1] = fab.runWriter();

        return [
            action(data),
            monoid.mappend<TLog>(log1, log2)
        ] as [B, TLog];
    });
}

export const applicative = <TLog>(monoid: IMonoid<TLog>): IWriterApplicative<TLog> => {
    const functor = functorBase<TLog>(monoid);
    const pure = pureWithMonoid(monoid);
    const lift = liftWithMonoid(monoid);

    return appBase(functor, { pure, lift }) as IWriterApplicative<TLog>;
}