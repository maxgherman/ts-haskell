import tap from 'tap'
import { bifunctor as createBifunctor, BifunctorBase } from 'data/bifunctor'
import { tuple2, fst, snd, Tuple2Box } from 'ghc/base/tuple/tuple'

tap.test('Bifunctor builder (derive first/second from bimap)', async (t) => {
    const base: BifunctorBase = {
        bimap: <A, B, C, D>(f: (a: A) => C, g: (b: B) => D, pab: Tuple2Box<A, B>): Tuple2Box<C, D> =>
            tuple2(f(fst(pab)), g(snd(pab))) as Tuple2Box<C, D>,
    }

    const BF = createBifunctor(base)

    const pair = tuple2(2, 'x') as Tuple2Box<number, string>

    const leftMapped = BF.first((n: number) => n + 1, pair) as Tuple2Box<number, string>
    t.same([fst(leftMapped), snd(leftMapped)], [3, 'x'])

    const rightMapped = BF.second((s: string) => s.toUpperCase(), pair) as Tuple2Box<number, string>
    t.same([fst(rightMapped), snd(rightMapped)], [2, 'X'])
})
