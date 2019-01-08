import { Application, Application2, Application3 } from '@common/types/application';
import { Writer } from '@data/writer';
import { IsWriter, WriterBox } from '@common/types/writer-box';
import { IMonad, IMonadBase, monad as monadBase } from '@control/common/monad';
import { IMonoid } from '@control/common/monoid';
import { applicative } from '@control/applicative/writer';

export interface IWriterMonad<TLog> extends IMonad<IsWriter> {
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

    '>>='<A,B>(ma: WriterBox<TLog,A>, action: Application<A, WriterBox<TLog,B>>): WriterBox<TLog,B>;
    '>>'<A,B>(ma: WriterBox<TLog,A>, mb: WriterBox<TLog,B>): WriterBox<TLog,B>;
    return<A>(a: A) : WriterBox<TLog,A>;
    fail<A>(value: string): WriterBox<TLog,A>;
}

const implementation = <TLog>(monoid: IMonoid<TLog>) => ({
    ">>="<A,B>(ma: WriterBox<TLog,A>, action: Application<A, WriterBox<TLog, B>>): WriterBox<TLog,B> {

        ma = ma || Writer.from([undefined as A, monoid.mempty<TLog>() as TLog]);
        action = action || (() => Writer.from([undefined as B, monoid.mempty<TLog>() as TLog]));
      
        return ma.mapWriter(([data, log1]) => {
            const writer = action(data);
            const [b, log2] = writer.runWriter();
           
            return [b, monoid.mappend<TLog>(log1, log2)] as [B, TLog];
        });
    },

    fail<A>(_: string): WriterBox<TLog, A> {
        return Writer.from([undefined as A, monoid.mempty<TLog>() as TLog]);
    },

    isOfType<A>(a:A) {
        return a instanceof Writer; 
    }
}) as IMonadBase<IsWriter>;

export const monad = <TLog>(monoid: IMonoid<TLog>) =>
    monadBase(implementation(monoid), applicative(monoid)) as IWriterMonad<TLog>;