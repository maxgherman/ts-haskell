import { Box2, Kind, Constraint, MinBox1 } from 'data/kind'
import { Bifunctor } from 'data/bifunctor'
import { BiFoldable } from 'data/bifoldable'
import { Applicative } from 'ghc/base/applicative'
import { Monad } from 'ghc/base/monad/monad'
import { id } from 'ghc/base/functions'

export type BiTraversableBase = Bifunctor &
    BiFoldable & {
        bitraverse<A, B, C, D>(
            app: Applicative,
            f: (a: A) => MinBox1<C>,
            g: (b: B) => MinBox1<D>,
            fab: Box2<A, B>,
        ): MinBox1<Box2<C, D>>
        bisequenceA<A, B>(app: Applicative, tfab: Box2<MinBox1<A>, MinBox1<B>>): MinBox1<Box2<A, B>>
    }

export type BiTraversable = BiTraversableBase & {
    bimapM<A, B, C, D>(m: Monad, f: (a: A) => MinBox1<C>, g: (b: B) => MinBox1<D>, fab: Box2<A, B>): MinBox1<Box2<C, D>>
    bisequence<A, B>(m: Monad, tfab: Box2<MinBox1<A>, MinBox1<B>>): MinBox1<Box2<A, B>>
    kind: (_: (_: '*') => (_: '*') => '*') => Constraint
}

export type BaseImplementation = Partial<Pick<BiTraversableBase, 'bitraverse' | 'bisequenceA'>> &
    (Pick<BiTraversableBase, 'bitraverse'> | Pick<BiTraversableBase, 'bisequenceA'>)

export const kindOf =
    (_: BiTraversable): Kind =>
    (_: (_: '*') => (_: '*') => '*') =>
        'Constraint' as Constraint

export const bitraversable = (
    base: BaseImplementation,
    bifunctor: Bifunctor,
    bifoldable: BiFoldable,
): BiTraversable => {
    const result: BiTraversableBase = {
        ...bifunctor,
        ...bifoldable,
        bitraverse: base.bitraverse as BiTraversableBase['bitraverse'],
        bisequenceA: base.bisequenceA as BiTraversableBase['bisequenceA'],
    }

    if (!base.bitraverse && base.bisequenceA) {
        result.bitraverse = <A, B, C, D>(
            app: Applicative,
            f: (a: A) => MinBox1<C>,
            g: (b: B) => MinBox1<D>,
            fab: Box2<A, B>,
        ): MinBox1<Box2<C, D>> => result.bisequenceA(app, result.bimap(f, g, fab))
    }

    if (!base.bisequenceA && base.bitraverse) {
        result.bisequenceA = <A, B>(app: Applicative, tfab: Box2<MinBox1<A>, MinBox1<B>>): MinBox1<Box2<A, B>> =>
            result.bitraverse(app, id, id, tfab)
    }

    return {
        ...result,
        bimapM: (m, f, g, fab) => result.bitraverse(m, f, g, fab),
        bisequence: (m, tfab) => result.bisequenceA(m, tfab),
        kind: kindOf(null as unknown as BiTraversable) as (_: (_: '*') => (_: '*') => '*') => 'Constraint',
    }
}
