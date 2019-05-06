import { identity } from 'ramda'
import { IApplicative, applicative as appBase } from '@control/common/applicative'
import { IsMaybe, MaybeBox } from '@common/types/maybe-box'
import { Maybe } from '@data/maybe'
import { functor } from '@control/functor/maybe'
import { Application, Application2, Application3 } from '@common/types/application'

export interface IMaybeApplicative extends IApplicative<IsMaybe> {
    fmap: <A, B>(f: (a: A) => B, fa: MaybeBox<A>) => MaybeBox<B>
    '<$>': <A, B>(f: (a: A) => B, fa: MaybeBox<A>) => MaybeBox<B>
    '<$': <A, B>(a: A, fb: MaybeBox<B>) => MaybeBox<A>
    '$>': <A, B>(fa: MaybeBox<A>, b: B) => MaybeBox<B>
    '<&>': <A, B>(fa: MaybeBox<A>, f: (a: A) => B) => MaybeBox<B>
    pure<A>(a:A): MaybeBox<A>
    lift<A, B>(fab: MaybeBox<Application<A, B>>, fa: MaybeBox<A>): MaybeBox<B>
    '<*>'<A, B>(fab: MaybeBox<Application<A, B>>, fa: MaybeBox<A>): MaybeBox<B>
    liftA<A, B>(f: Application<A, B>, fa: MaybeBox<A>): MaybeBox<B>
    liftA2<A, B, C, X extends Application2<A, B, C>>(
        abc: X, fa: MaybeBox<A>, fb: MaybeBox<B>): MaybeBox<C>
    liftA3<A, B, C, D>(
        f: Application3<A, B, C, D>,
        fa: MaybeBox<A>, fb: MaybeBox<B>,
        fc: MaybeBox<C>): MaybeBox<D>
    '*>'<A, B>(fa: MaybeBox<A>, fb: MaybeBox<B>): MaybeBox<B>
    '<*'<A, B>(fa: MaybeBox<A>, fb: MaybeBox<B>): MaybeBox<A>
    '<**>'<A, B>(fa: MaybeBox<A>, fab: MaybeBox<Application<A, B>>): MaybeBox<B>
}

const pure = <A>(a: A): MaybeBox<A> => {
    return Maybe.from(a)
}

const lift = <A, B>(fab: MaybeBox<Application<A, B>>, fa: MaybeBox<A>): MaybeBox<B> => {
    fab = fab || Maybe.just(identity as Application<A, B>)
    fa = fa || Maybe.nothing()

    return fab.isNothing ? Maybe.nothing() : functor.fmap(fab.value, fa)
}

export const applicative = appBase(functor, { pure, lift }) as IMaybeApplicative
