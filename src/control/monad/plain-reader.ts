import { identity, compose } from 'ramda';
import { Application, Application2, Application3 } from '@common/types/application';
import { IsPlainReader, PlainReaderBox } from '@common/types/plain-reader-box';
import { IMonad, IMonadBase, monad as monadBase } from '@control/common/monad';
import { applicative } from '@control/applicative/plain-reader';

export interface IPlainReaderMonad<T> extends IMonad<IsPlainReader> {
    fmap: <A, B>(f: (a: A) => B, fa: PlainReaderBox<T,A>) => PlainReaderBox<T,B>;
    '<$>': <A, B>(f: (a: A) => B, fa: PlainReaderBox<T,A>) => PlainReaderBox<T,B>;
    '<$': <A, B>(a: A, fb: PlainReaderBox<T,B>) => PlainReaderBox<T,A>;
    '$>': <A, B>(fa: PlainReaderBox<T,A>, b: B) => PlainReaderBox<T,B>;
    '<&>': <A, B>(fa: PlainReaderBox<T,A>, f: (a: A) => B) => PlainReaderBox<T,B>;

    pure<A>(a:A): PlainReaderBox<T,A>;
    lift<A, B>(fab: PlainReaderBox<T,Application<A, B>>, fa: PlainReaderBox<T,A>): PlainReaderBox<T,B>;
    '<*>'<A, B>(fab: PlainReaderBox<T,Application<A, B>>, fa: PlainReaderBox<T,A>): PlainReaderBox<T,B>;
    liftA<A, B>(f: Application<A, B>, fa: PlainReaderBox<T,A>): PlainReaderBox<T,B>;
    liftA2<A, B, C, X extends Application2<A, B, C>>(abc: X, fa: PlainReaderBox<T,A>, fb: PlainReaderBox<T,B>): PlainReaderBox<T,C>;
    liftA3<A, B, C, D>(f: Application3<A, B, C, D>, fa: PlainReaderBox<T,A>, fb: PlainReaderBox<T,B>, fc: PlainReaderBox<T,C>): PlainReaderBox<T,D>; 
    '*>'<A, B>(fa: PlainReaderBox<T,A>, fb: PlainReaderBox<T,B>): PlainReaderBox<T,B>;
    '<*'<A, B>(fa: PlainReaderBox<T,A>, fb: PlainReaderBox<T,B>): PlainReaderBox<T,A>;
    '<**>'<A, B>(fa: PlainReaderBox<T,A>, fab: PlainReaderBox<T,Application<A, B>>): PlainReaderBox<T,B>;
    
    '>>='<A,B>(ma: PlainReaderBox<T,A>, action: Application<A, PlainReaderBox<T,B>>): PlainReaderBox<T,B>;
    '>>'<A,B>(ma: PlainReaderBox<T,A>, mb: PlainReaderBox<T,B>): PlainReaderBox<T,B>;
    return<A>(a: A) : PlainReaderBox<T,A>;
    fail<A>(value: string): PlainReaderBox<T,A>;
}

const implementation = {
    ">>="<R,A,B>(ma: PlainReaderBox<R,A>, action: Application<A, PlainReaderBox<R,B>>): PlainReaderBox<R,B> {
        ma = ma || identity as PlainReaderBox<R,A>;
        action = action || (() => identity) as  Application<A, PlainReaderBox<R,B>>;
        
        return (r:R) =>
            compose(
                x => x(r),
                action,
                ma
            )(r);
    },

    fail<R,A>(_: string): PlainReaderBox<R,A> {
        return identity as PlainReaderBox<R,A>;
    },

    isOfType<A>(a:A) {
        return (typeof a === 'function' && a.length === 1); 
    }
} as IMonadBase<IsPlainReader>;

export const monad = <T>() => monadBase(implementation, applicative<T>()) as IPlainReaderMonad<T>;