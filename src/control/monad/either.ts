import { Application, Application2, Application3 } from '@common/types/application'
import { IsEither, EitherBox } from '@common/types/either-box'
import { Either } from '@data/either'
import { IMonad, IMonadBase, monad as monadBase } from '@control/common/monad'
import { applicative } from '@control/applicative/either'

export interface IEitherMonad<T> extends IMonad<IsEither> {
    fmap: <A, B>(f: (a: A) => B, fa: EitherBox<T, A>) => EitherBox<T, B>
    '<$>': <A, B>(f: (a: A) => B, fa: EitherBox<T, A>) => EitherBox<T, B>
    '<$': <A, B>(a: A, fb: EitherBox<T, B>) => EitherBox<T, A>
    '$>': <A, B>(fa: EitherBox<T, A>, b: B) => EitherBox<T, B>
    '<&>': <A, B>(fa: EitherBox<T, A>, f: (a: A) => B) => EitherBox<T, B>

    pure<A>(a:A): EitherBox<T, A>
    lift<A, B>(fab: EitherBox<T, Application<A, B>>, fa: EitherBox<T, A>): EitherBox<T, B>
    '<*>'<A, B>(fab: EitherBox<T, Application<A, B>>, fa: EitherBox<T, A>): EitherBox<T, B>
    liftA<A, B>(f: Application<A, B>, fa: EitherBox<T, A>): EitherBox<T, B>
    liftA2<A, B, C, X extends Application2<A, B, C>>(
        abc: X, fa: EitherBox<T, A>, fb: EitherBox<T, B>): EitherBox<T, C>
    liftA3<A, B, C, D>(
        f: Application3<A, B, C, D>,
        fa: EitherBox<T, A>,
        fb: EitherBox<T, B>,
        fc: EitherBox<T, C>): EitherBox<T, D>
    '*>'<A, B>(fa: EitherBox<T, A>, fb: EitherBox<T, B>): EitherBox<T, B>
    '<*'<A, B>(fa: EitherBox<T, A>, fb: EitherBox<T, B>): EitherBox<T, A>
    '<**>'<A, B>(fa: EitherBox<T, A>, fab: EitherBox<T, Application<A, B>>): EitherBox<T, B>

    '>>='<A, B>(ma: EitherBox<T, A>, action: Application<A, EitherBox<T, B>>): EitherBox<T, B>
    '>>'<A, B>(ma: EitherBox<T, A>, mb: EitherBox<T, B>): EitherBox<T, B>
    return<A>(a: A) : EitherBox<T, A>
    fail<A>(value: string): EitherBox<string, A>
}

const implementation = {
    '>>='<R, A, B>(ma: EitherBox<R, A>, action: Application<A, EitherBox<R, B>>): EitherBox<R, B> {
        ma = ma || Either.left(undefined)
        action = action || (() => Either.left(undefined))

        if (ma.isLeft) {
            return Either.left(ma.value) as EitherBox<R, B>
        }

        return action(ma.value as A)
    },

    fail<A>(a: string): EitherBox<string, A> {
        return Either.left(a)
    },

    isOfType<A>(a:A) {
        return a instanceof Either
    }
} as IMonadBase<IsEither>

export const monad = <T>() => monadBase(implementation, applicative<T>()) as IEitherMonad<T>
