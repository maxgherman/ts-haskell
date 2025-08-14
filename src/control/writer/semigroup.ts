import { MinBox0 } from 'data/kind'
import { Semigroup, semigroup as createSemigroup, SemigroupBase } from 'ghc/base/semigroup'
import { tuple2 } from 'ghc/base/tuple/tuple'
import { writer, WriterMinBox } from './writer'

export type WriterSemigroup<W, A> = Semigroup<WriterMinBox<W, A>>

const base = <W, A>(wSemigroup: Semigroup<W>, aSemigroup: Semigroup<A>): SemigroupBase<WriterMinBox<W, A>> => ({
    '<>': (a, b) =>
        writer(() => {
            const [a1, w1] = (a as WriterMinBox<W, A>).runWriter()
            const [a2, w2] = (b as WriterMinBox<W, A>).runWriter()
            return tuple2(aSemigroup['<>'](a1, a2), wSemigroup['<>'](w1 as MinBox0<W>, w2 as MinBox0<W>))
        }),
})

export const semigroup = <W, A>(wSemigroup: Semigroup<W>, aSemigroup: Semigroup<A>): WriterSemigroup<W, A> =>
    createSemigroup(base<W, A>(wSemigroup, aSemigroup)) as WriterSemigroup<W, A>
