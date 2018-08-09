import { identity, always } from 'ramda';
import { IApplicative, Application, Application2, Application3, applicative as appBase } from '@common/types/applicative';
import { IsWriter, WriterF, functor } from '@control/functor/writer';
import { Writer } from '@data/writer';

export interface IWriterApplicative<T> extends IApplicative<IsWriter> {
    fmap: <A, B>(f: (a: A) => B, fa: WriterF<T, A>) => WriterF<T, B>;
    '<$>': <A, B>(f: (a: A) => B, fa: WriterF<T, A>) => WriterF<T, B>;
    '<$': <A, B>(a: A, fb: WriterF<T, B>) => WriterF<T, A>;
    '$>': <A, B>(fa: WriterF<T, A>, b: B) => WriterF<T, B>;
    '<&>': <A, B>(fa: WriterF<T, A>, f: (a: A) => B) => WriterF<T, B>;
    pure<A>(a:A): WriterF<T, A>;
    lift<A, B>(fab: WriterF<T, Application<A, B>>, fa: WriterF<T, A>): WriterF<T, B>;
    liftA2<A, B, C>(abc: Application2<A, B, C>, fa: WriterF<T, A>, fb: WriterF<T, B>): WriterF<T, C>;
    '*>'<A, B, C>(fa: WriterF<T, A>, fb: WriterF<T, B>): WriterF<T, C>;
    '<*'<A, B, C>(fa: WriterF<T, A>, fb: WriterF<T, B>): WriterF<T, C>;
    '<**>'<A, B>(fa: WriterF<T, A>, fab: WriterF<T, Application<A, B>>): WriterF<T, B>;
    liftA<A, B>(f: Application<A, B>, fa: WriterF<T, A>): WriterF<T, B>;
    liftA3<A, B, C, D>(f: Application3<A, B, C, D>, fa: WriterF<T, A>, fb: WriterF<T, B>, fc: WriterF<T, C>): WriterF<T, D>; 
}

// pure a = \_ -> a
// const pure = <R,A>(a: A) => 

// f <*> g = \x -> f x (g x)
// const lift =
//     <R, A, B>(fab: ReaderF<R, Application<A, B>>, fa: ReaderF<R, A>): ReaderF<R, B> => {
    
//     // fab :: r -> a -> b
//     fab = fab ||  Reader.from(always(identity)) as ReaderF<R, Application<A, B>>;
//     // fab = fab || Reader.from((_) => identity) as ReaderF<R, Application<A, B>>;
//     fa = fa || Reader.from(identity as Application<R, A>) as ReaderF<R, A>;

//     return Reader.from((x: R) => {
//         const fax = fa.runReader(x);
//         return fab.runReader(x)(fax);
//     });
// }