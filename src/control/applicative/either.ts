import { identity } from 'ramda'
import { IApplicative, applicative as appBase } from '@control/common/applicative'
import { Either } from '@data/either'
import { IsEither, EitherBox  } from '@common/types/either-box'
import { functor, IEitherFunctor } from '@control/functor/either'
import { Application, Application2, Application3 } from '@common/types/application'

export interface IEitherApplicative<T> extends IApplicative<IsEither> {
    fmap: <A, B>(f: (a: A) => B, fa: EitherBox<T, A>) => EitherBox<T, B>
    '<$>': <A, B>(f: (a: A) => B, fa: EitherBox<T, A>) => EitherBox<T, B>
    '<$': <A, B>(a: A, fb: EitherBox<T, B>) => EitherBox<T, A>
    '$>': <A, B>(fa: EitherBox<T, A>, b: B) => EitherBox<T, B>
    '<&>': <A, B>(fa: EitherBox<T, A>, f: (a: A) => B) => EitherBox<T, B>
    pure<A>(a:A): EitherBox<T, A>
    lift<A, B>(fab: EitherBox<T, Application<A, B>>, fa: EitherBox<T, A>): EitherBox<T, B>
    '<*>'<A, B>(fab: EitherBox<T, Application<A, B>>, fa: EitherBox<T, A>): EitherBox<T, B>
    liftA<A, B>(f: Application<A, B>, fa: EitherBox<T, A>): EitherBox<T, B>
    liftA2<A, B, C>(
        abc: Application2<A, B, C>,
        fa: EitherBox<T, A>,
        fb: EitherBox<T, B>): EitherBox<T, C>
    liftA3<A, B, C, D>(
        f: Application3<A, B, C, D>,
        fa: EitherBox<T, A>,
        fb: EitherBox<T, B>, fc: EitherBox<T, C>): EitherBox<T, D>
    '*>'<A, B>(fa: EitherBox<T, A>, fb: EitherBox<T, B>): EitherBox<T, B>
    '<*'<A, B>(fa: EitherBox<T, A>, fb: EitherBox<T, B>): EitherBox<T, A>
    '<**>'<A, B>(fa: EitherBox<T, A>, fab: EitherBox<T, Application<A, B>>): EitherBox<T, B>
}

const pure = <R, A>(a: A): EitherBox<R, A> => {
    return a === null || a === undefined ?
        Either.left(undefined) : Either.right(a)
}

const lift = <R>(functor: IEitherFunctor<R>) =>
    <A, B>(fab: EitherBox<R, Application<A, B>>, fa: EitherBox<R, A>): EitherBox<R, B> => {

        fab = fab || Either.right(identity as Application<A, B>)
        fa = fa || Either.left(undefined)

        if (fab.isLeft) {
            return Either.left(fab.value) as EitherBox<R, B>
        }

        return functor.fmap(fab.value as Application<A, B>, fa)
    }

export const applicative = <T>(): IEitherApplicative<T> => {
    const f = functor<T>()
    return appBase(f, { pure, lift: lift(f) }) as IEitherApplicative<T>
}