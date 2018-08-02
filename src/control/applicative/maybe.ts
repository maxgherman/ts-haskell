import { IApplicative, Application, Application2, applicative as appBase } from '@common/types';
import { Maybe } from '@data/maybe';
import { MaybeF, IsMaybe, functor } from '@control/functor/maybe';

export interface IMaybeApplicative extends IApplicative<IsMaybe> {
    fmap: <A, B>(f: (a: A) => B, fa: MaybeF<A>) => MaybeF<B>;
    '<$>': <A, B>(f: (a: A) => B, fa: MaybeF<A>) => MaybeF<B>;
    '<$': <A, B>(a: A, fb: MaybeF<B>) => MaybeF<A>;
    '$>': <A, B>(fa: MaybeF<A>, b: B) => MaybeF<B>;
    '<&>': <A, B>(fa: MaybeF<A>, f: (a: A) => B) => MaybeF<B>;
    pure<A>(a:A): MaybeF<A>;
    lift<A, B>(fab: MaybeF<Application<A, B>>, fa: MaybeF<A>): MaybeF<B>;
    liftA2<A, B, C, X extends Application2<A, B, C>>(abc: X, fa: MaybeF<A>, fb: MaybeF<A>): MaybeF<A>;
}

const pure = <A>(a: A): MaybeF<A> => {
    return Maybe.from(a);
}

const lift = <A, B>(fab: MaybeF<Application<A, B>>, fa: MaybeF<A>): MaybeF<B> => {
    fab = fab || Maybe.nothing();
    fa = fa || Maybe.nothing();

    return fab.isNothing ? Maybe.nothing() : functor.fmap(fab.value, fa);
}

export const applicative = appBase(functor, { pure, lift }) as IMaybeApplicative;
