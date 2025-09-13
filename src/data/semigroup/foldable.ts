import { MinBox1, MinBox0, Kind, Constraint } from 'data/kind'
import { Semigroup } from 'ghc/base/semigroup'

export type Foldable1Base = {
    foldMap1<A, M>(s: Semigroup<M>, f: (a: A) => MinBox0<M>, fa: MinBox1<A>): MinBox0<M>
}

export type Foldable1 = Foldable1Base & {
    fold1<M>(s: Semigroup<M>, fa: MinBox1<M>): MinBox0<M>
    kind: (_: (_: '*') => '*') => Constraint
}

export const kindOf =
    (_: Foldable1): Kind =>
    (_: (_: '*') => '*') =>
        'Constraint' as Constraint

export const foldable1 = (base: Foldable1Base): Foldable1 => ({
    ...base,
    fold1: <M>(s: Semigroup<M>, fa: MinBox1<M>) => base.foldMap1<M, M>(s, (x) => x as unknown as MinBox0<M>, fa),
    kind: kindOf(null as unknown as Foldable1) as (_: (_: '*') => '*') => 'Constraint',
})
