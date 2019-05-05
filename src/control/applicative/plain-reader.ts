import { identity, always } from 'ramda';
import { IApplicative, applicative as appBase } from '@control/common/applicative';
import { IsPlainReader, PlainReaderBox } from '@common/types/plain-reader-box';
import { functor } from '@control/functor/plain-reader';
import { Application, Application2, Application3 } from '@common/types/application';

export interface IReaderApplicative<T> extends IApplicative<IsPlainReader> {
    fmap: <A, B>(f: (a: A) => B, fa: PlainReaderBox<T, A>) => PlainReaderBox<T, B>;
    '<$>': <A, B>(f: (a: A) => B, fa: PlainReaderBox<T, A>) => PlainReaderBox<T, B>;
    '<$': <A, B>(a: A, fb: PlainReaderBox<T, B>) => PlainReaderBox<T, A>;
    '$>': <A, B>(fa: PlainReaderBox<T, A>, b: B) => PlainReaderBox<T, B>;
    '<&>': <A, B>(fa: PlainReaderBox<T, A>, f: (a: A) => B) => PlainReaderBox<T, B>;
    pure<A>(a:A): PlainReaderBox<T, A>;
    lift<A, B>(fab: PlainReaderBox<T, Application<A, B>>, fa: PlainReaderBox<T, A>): PlainReaderBox<T, B>;
    '<*>'<A, B>(fab: PlainReaderBox<T, Application<A, B>>, fa: PlainReaderBox<T, A>): PlainReaderBox<T, B>;
    liftA<A, B>(f: Application<A, B>, fa: PlainReaderBox<T, A>): PlainReaderBox<T, B>;
    liftA2<A, B, C>(abc: Application2<A, B, C>, fa: PlainReaderBox<T, A>, fb: PlainReaderBox<T, B>): PlainReaderBox<T, C>;
    liftA3<A, B, C, D>(f: Application3<A, B, C, D>, fa: PlainReaderBox<T, A>, fb: PlainReaderBox<T, B>, fc: PlainReaderBox<T, C>): PlainReaderBox<T, D>;
    '*>'<A, B>(fa: PlainReaderBox<T, A>, fb: PlainReaderBox<T, B>): PlainReaderBox<T, B>;
    '<*'<A, B>(fa: PlainReaderBox<T, A>, fb: PlainReaderBox<T, B>): PlainReaderBox<T, A>;
    '<**>'<A, B>(fa: PlainReaderBox<T, A>, fab: PlainReaderBox<T, Application<A, B>>): PlainReaderBox<T, B>;
}

// pure a = \_ -> a
const pure: (<R,A>(a: A)=> PlainReaderBox<R, A>) = always;

// f <*> g = \x -> f x (g x)
const lift =
    <R, A, B>(fab: PlainReaderBox<R, Application<A, B>>, fa: PlainReaderBox<R, A>): PlainReaderBox<R, B> => {
    
    // fab :: r -> a -> b
    fab = fab || always(identity as Application<A, B>);

    // fab = fab || ((_) => identity) as PlainReaderBox<R, Application<A, B>>;
    fa = fa || identity as PlainReaderBox<R, A>;

    return (x) => fab(x)(fa(x));
}

export const applicative = <T>(): IReaderApplicative<T> => {
    const f = functor<T>();
    return appBase(f, { pure, lift }) as IReaderApplicative<T>;
};