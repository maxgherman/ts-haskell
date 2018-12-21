import { identity, always } from 'ramda';
import { IApplicative, applicative as appBase } from '@control/common/applicative';
import { IsPlainReader, ReaderF, functor } from '@control/functor/plain-reader';
import { Application, Application2, Application3 } from '@common/types/application';

export interface IReaderApplicative<T> extends IApplicative<IsPlainReader> {
    fmap: <A, B>(f: (a: A) => B, fa: ReaderF<T, A>) => ReaderF<T, B>;
    '<$>': <A, B>(f: (a: A) => B, fa: ReaderF<T, A>) => ReaderF<T, B>;
    '<$': <A, B>(a: A, fb: ReaderF<T, B>) => ReaderF<T, A>;
    '$>': <A, B>(fa: ReaderF<T, A>, b: B) => ReaderF<T, B>;
    '<&>': <A, B>(fa: ReaderF<T, A>, f: (a: A) => B) => ReaderF<T, B>;
    pure<A>(a:A): ReaderF<T, A>;
    lift<A, B>(fab: ReaderF<T, Application<A, B>>, fa: ReaderF<T, A>): ReaderF<T, B>;
    '<*>'<A, B>(fab: ReaderF<T, Application<A, B>>, fa: ReaderF<T, A>): ReaderF<T, B>;
    liftA<A, B>(f: Application<A, B>, fa: ReaderF<T, A>): ReaderF<T, B>;
    liftA2<A, B, C>(abc: Application2<A, B, C>, fa: ReaderF<T, A>, fb: ReaderF<T, B>): ReaderF<T, C>;
    liftA3<A, B, C, D>(f: Application3<A, B, C, D>, fa: ReaderF<T, A>, fb: ReaderF<T, B>, fc: ReaderF<T, C>): ReaderF<T, D>;
    '*>'<A, B>(fa: ReaderF<T, A>, fb: ReaderF<T, B>): ReaderF<T, B>;
    '<*'<A, B>(fa: ReaderF<T, A>, fb: ReaderF<T, B>): ReaderF<T, A>;
    '<**>'<A, B>(fa: ReaderF<T, A>, fab: ReaderF<T, Application<A, B>>): ReaderF<T, B>;
}

// pure a = \_ -> a
const pure: (<R,A>(a: A)=> ReaderF<R, A>) = always;

// f <*> g = \x -> f x (g x)
const lift =
    <R, A, B>(fab: ReaderF<R, Application<A, B>>, fa: ReaderF<R, A>): ReaderF<R, B> => {
    
    // fab :: r -> a -> b
    fab = fab || always(identity) as ReaderF<R, Application<A, B>>;
    // fab = fab || ((_) => identity) as ReaderF<R, Application<A, B>>;
    fa = fa || identity as ReaderF<R, A>;

    return (x) => fab(x)(fa(x));
}

export const applicative = <T>(): IReaderApplicative<T> => {
    const f = functor<T>();
    return appBase(f, { pure, lift }) as IReaderApplicative<T>;
};