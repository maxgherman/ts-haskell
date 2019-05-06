import { identity } from 'ramda'
import { IApplicative, applicative as appBase } from '@control/common/applicative'
import { functor  } from '@control/functor/promise'
import { IsPromise, PromiseBox } from '@common/types/promise-box'
import { Application, Application2, Application3 } from '@common/types/application'

export interface IPlainArrayApplicative extends IApplicative<IsPromise> {
    fmap: <A, B>(f: (a: A) => B, fa: PromiseBox<A>) => PromiseBox<B>
    '<$>': <A, B>(f: (a: A) => B, fa: PromiseBox<A>) => PromiseBox<B>
    '<$': <A, B>(a: A, fb: PromiseBox<B>) => PromiseBox<A>
    '$>': <A, B>(fa: PromiseBox<A>, b: B) => PromiseBox<B>
    '<&>': <A, B>(fa: PromiseBox<A>, f: (a: A) => B) => PromiseBox<B>
    pure<A>(a:A): PromiseBox<A>
    lift<A, B>(fab: PromiseBox<Application<A, B>>, fa: PromiseBox<A>): PromiseBox<B>
    '<*>'<A, B>(fab: PromiseBox<Application<A, B>>, fa: PromiseBox<A>): PromiseBox<B>
    liftA<A, B>(f: Application<A, B>, fa: PromiseBox<A>): PromiseBox<B>
    liftA2<A, B, C, X extends Application2<A, B, C>>(
        abc: X, fa: PromiseBox<A>, fb: PromiseBox<B>): PromiseBox<C>
    liftA3<A, B, C, D>(
        f: Application3<A, B, C, D>,
        fa: PromiseBox<A>, fb: PromiseBox<B>, fc: PromiseBox<C>): PromiseBox<D>
    '*>'<A, B>(fa: PromiseBox<A>, fb: PromiseBox<B>): PromiseBox<B>
    '<*'<A, B>(fa: PromiseBox<A>, fb: PromiseBox<B>): PromiseBox<A>;
    '<**>'<A, B>(fa: PromiseBox<A>, fab: PromiseBox<Application<A, B>>): PromiseBox<B>
}

const pure = <A>(a: A): PromiseBox<A> => {
    return Promise.resolve(a)
}

const lift = <A, B>(fab: PromiseBox<Application<A, B>>, fa: PromiseBox<A>): PromiseBox<B> => {
    fab = fab || Promise.resolve(identity as Application<A, B>)
    fa = fa || Promise.resolve()

    const result = Promise.all([fab as Promise<Application<A, B>>, fa as Promise<A>])
    .then(([app, value]) => {
        app = app || identity as Application<A, B>
        return app(value)
    })

    return result
}

export const applicative = appBase(functor, { pure, lift }) as IPlainArrayApplicative
