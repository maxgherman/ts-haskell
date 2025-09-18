import { Box1, MinBox0, MinBox1, Type } from 'data/kind'
import type { Monad } from 'ghc/base/monad/monad'
import { MaybeBox, just } from 'ghc/base/maybe/maybe'

export interface MaybeT<A> {
    readonly runMaybeT: () => MinBox1<MaybeBox<A>>
}

export type MaybeTBox<A> = MaybeT<A> & Box1<A>

export type MaybeTMinBox<A> = MaybeT<MinBox0<A>> & Box1<MinBox0<A>>

export const maybeT = <A>(fn: () => MinBox1<MaybeBox<A>>): MaybeTBox<A> => ({
    runMaybeT: fn,
    // Unary placeholder for kind annotation
    kind: (_: '*') => '*' as Type,
})

export const runMaybeT = <A>(ma: MaybeT<A>): MinBox1<MaybeBox<A>> => ma.runMaybeT()

// lift :: Monad m => m a -> MaybeT m a
export const lift = <A>(m: Monad, ma: MinBox1<A>): MaybeTBox<A> =>
    maybeT(() => m['<$>']((a: A) => just(a as NonNullable<A>), ma))
