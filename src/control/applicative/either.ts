import { identity } from 'ramda';
import { IApplicative, Application, Application2, Application3, applicative as appBase } from '@common/types/applicative';
import { Either } from '@data/either';
import { IsEither, EitherF, functor, IEitherFunctor } from '@control/functor/either';

export interface IEitherApplicative<T> extends IApplicative<IsEither> {
    fmap: <A, B>(f: (a: A) => B, fa: EitherF<T, A>) => EitherF<T, B>;
    '<$>': <A, B>(f: (a: A) => B, fa: EitherF<T, A>) => EitherF<T, B>;
    '<$': <A, B>(a: A, fb: EitherF<T, B>) => EitherF<T, A>;
    '$>': <A, B>(fa: EitherF<T, A>, b: B) => EitherF<T, B>;
    '<&>': <A, B>(fa: EitherF<T, A>, f: (a: A) => B) => EitherF<T, B>;
    pure<A>(a:A): EitherF<T, A>;
    lift<A, B>(fab: EitherF<T, Application<A, B>>, fa: EitherF<T, A>): EitherF<T, B>;
    liftA2<A, B, C>(abc: Application2<A, B, C>, fa: EitherF<T, A>, fb: EitherF<T, B>): EitherF<T, C>;
    '*>'<A, B>(fa: EitherF<T, A>, fb: EitherF<T, B>): EitherF<T, B>;
    '<*'<A, B>(fa: EitherF<T, A>, fb: EitherF<T, B>): EitherF<T, A>;
    '<**>'<A, B>(fa: EitherF<T, A>, fab: EitherF<T, Application<A, B>>): EitherF<T, B>;
    liftA<A, B>(f: Application<A, B>, fa: EitherF<T, A>): EitherF<T, B>;
    liftA3<A, B, C, D>(f: Application3<A, B, C, D>, fa: EitherF<T, A>, fb: EitherF<T, B>, fc: EitherF<T, C>): EitherF<T, D>; 
}

const pure = <R,A>(a: A): EitherF<R, A> => {
    return Either.right(a) as EitherF<R, A>;
}

const lift = <R>(functor: IEitherFunctor<R>) =>
    <A, B>(fab: EitherF<R, Application<A, B>>, fa: EitherF<R, A>): EitherF<R, B> => {
    
    fab = fab || Either.right(identity) as EitherF<R, Application<A, B>>;
    fa = fa || Either.right(undefined);
    
    if(fab.isLeft) {
        return Either.left(fab.value) as EitherF<R, B>;
    }

    return functor.fmap(fab.value as Application<A, B>, fa);
}

export const applicative = <T>(): IEitherApplicative<T> => {
    const f = functor<T>();
    return appBase(f, { pure, lift: lift(f)}) as IEitherApplicative<T>;
};