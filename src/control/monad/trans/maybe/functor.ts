import { Functor, functor as createFunctor, FunctorBase } from 'ghc/base/functor'
import type { Monad } from 'ghc/base/monad/monad'
import type { MinBox1 } from 'data/kind'
import { MaybeBox } from 'ghc/base/maybe/maybe'
import { functor as maybeFunctor } from 'ghc/base/maybe/functor'
import { MaybeTBox, maybeT } from './maybe-t'

export interface MaybeTFunctor extends Functor {
    fmap<A, B>(f: (a: A) => B, fa: MaybeTBox<A>): MaybeTBox<B>

    '<$>'<A, B>(f: (a: A) => B, fa: MaybeTBox<A>): MaybeTBox<B>

    '<$'<A, B>(a: A, fb: MaybeTBox<B>): MaybeTBox<A>

    '$>'<A, B>(fa: MaybeTBox<A>, b: B): MaybeTBox<B>

    '<&>'<A, B>(fa: MaybeTBox<A>, f: (a: A) => B): MaybeTBox<B>

    void<A>(fa: MaybeTBox<A>): MaybeTBox<[]>
}

const base = (m: Monad): FunctorBase => ({
    fmap: <A, B>(f: (a: A) => B, fa: MaybeTBox<A>): MaybeTBox<B> =>
        maybeT(
            () =>
                m['<$>'](
                    (mb: MaybeBox<A>) => maybeFunctor.fmap(f as (a: A) => B, mb) as unknown as MaybeBox<B>,
                    fa.runMaybeT(),
                ) as unknown as MinBox1<MaybeBox<B>>,
        ),
})

export const functor = (m: Monad): MaybeTFunctor => createFunctor(base(m)) as MaybeTFunctor
