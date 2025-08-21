import { MinBox1, Kind, Constraint } from 'data/kind'
import { Functor } from 'ghc/base/functor'
import { Foldable } from 'data/foldable'
import { Applicative } from 'ghc/base/applicative'
import { Monad } from 'ghc/base/monad/monad'
import { id } from 'ghc/base/functions'

export type TraversableBase = Functor &
    Foldable & {
        traverse<A, B>(app: Applicative, f: (a: A) => MinBox1<B>, ta: MinBox1<A>): MinBox1<MinBox1<B>>
        sequenceA<A>(app: Applicative, tfa: MinBox1<MinBox1<A>>): MinBox1<MinBox1<A>>
    }

export type Traversable = TraversableBase & {
    mapM<A, B>(m: Monad, f: (a: A) => MinBox1<B>, ta: MinBox1<A>): MinBox1<MinBox1<B>>
    sequence<A>(m: Monad, tfa: MinBox1<MinBox1<A>>): MinBox1<MinBox1<A>>
    kind: (_: (_: '*') => '*') => Constraint
}

export type BaseImplementation = Partial<Pick<TraversableBase, 'traverse' | 'sequenceA'>> &
    (Pick<TraversableBase, 'traverse'> | Pick<TraversableBase, 'sequenceA'>)

export const kindOf =
    (_: Traversable): Kind =>
    (_: (_: '*') => '*') =>
        'Constraint' as Constraint

export const traversable = (base: BaseImplementation, functor: Functor, foldable: Foldable): Traversable => {
    const result: TraversableBase = {
        ...functor,
        ...foldable,
        traverse: base.traverse as TraversableBase['traverse'],
        sequenceA: base.sequenceA as TraversableBase['sequenceA'],
    }

    if (!base.traverse && base.sequenceA) {
        result.traverse = <A, B>(app: Applicative, f: (a: A) => MinBox1<B>, ta: MinBox1<A>) =>
            result.sequenceA(app, functor.fmap(f, ta))
    }

    if (!base.sequenceA && base.traverse) {
        result.sequenceA = <A>(app: Applicative, tfa: MinBox1<MinBox1<A>>) => result.traverse(app, id, tfa)
    }

    return {
        ...result,
        mapM: (m, f, ta) => result.traverse(m, f, ta),
        sequence: (m, tfa) => result.sequenceA(m, tfa),
        kind: kindOf(null as unknown as Traversable) as (_: (_: '*') => '*') => 'Constraint',
    }
}
