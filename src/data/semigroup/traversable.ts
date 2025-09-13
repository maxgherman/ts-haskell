import { MinBox1, Kind, Constraint } from 'data/kind'
import { Functor } from 'ghc/base/functor'
import { Apply } from 'data/functor/apply'
import { id } from 'ghc/base/functions'
import { Foldable1 } from 'data/semigroup/foldable'

export type Traversable1Base = Functor & {
    traverse1<A, B>(ap: Apply, f: (a: A) => MinBox1<B>, ta: MinBox1<A>): MinBox1<MinBox1<B>>
    sequence1<A>(ap: Apply, tfa: MinBox1<MinBox1<A>>): MinBox1<MinBox1<A>>
}

export type Traversable1 = Traversable1Base & {
    kind: (_: (_: '*') => '*') => Constraint
}

export type BaseImplementation = Partial<Pick<Traversable1Base, 'traverse1' | 'sequence1'>> &
    (Pick<Traversable1Base, 'traverse1'> | Pick<Traversable1Base, 'sequence1'>)

export const kindOf =
    (_: Traversable1): Kind =>
    (_: (_: '*') => '*') =>
        'Constraint' as Constraint

export const traversable1 = (base: BaseImplementation, functor: Functor, _foldable1: Foldable1): Traversable1 => {
    const result: Traversable1Base = {
        ...functor,
        traverse1: base.traverse1 as Traversable1Base['traverse1'],
        sequence1: base.sequence1 as Traversable1Base['sequence1'],
    }

    if (!base.traverse1 && base.sequence1) {
        result.traverse1 = <A, B>(ap: Apply, f: (a: A) => MinBox1<B>, ta: MinBox1<A>) =>
            result.sequence1(ap, functor.fmap(f, ta))
    }

    if (!base.sequence1 && base.traverse1) {
        result.sequence1 = <A>(ap: Apply, tfa: MinBox1<MinBox1<A>>) => result.traverse1(ap, id, tfa)
    }

    return {
        ...result,
        kind: kindOf(null as unknown as Traversable1) as (_: (_: '*') => '*') => 'Constraint',
    }
}
