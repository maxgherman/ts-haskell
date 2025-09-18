import { Box2, MinBox0, MinBox1, Type } from 'data/kind'
import type { Monad } from 'ghc/base/monad/monad'
import { EitherBox, right } from 'data/either/either'

export interface EitherT<E, A> {
    readonly runEitherT: () => MinBox1<EitherBox<E, A>>
}

export type EitherTBox<E, A> = EitherT<E, A> & Box2<E, A>

export type EitherTMinBox<E, A> = EitherT<E, MinBox0<A>> & Box2<E, MinBox0<A>>

export const eitherT = <E, A>(fn: () => MinBox1<EitherBox<E, A>>): EitherTBox<E, A> => ({
    runEitherT: fn,
    // Binary placeholder for kind annotation
    kind: (_: '*') => (_: '*') => '*' as Type,
})

export const runEitherT = <E, A>(ma: EitherT<E, A>): MinBox1<EitherBox<E, A>> => ma.runEitherT()

// lift :: Monad m => m a -> EitherT e m a
export const lift = <E, A>(m: Monad, ma: MinBox1<A>): EitherTBox<E, A> =>
    eitherT(() => m['<$>']((a: A) => right<E, A>(a as NonNullable<A>) as EitherBox<E, A>, ma))
