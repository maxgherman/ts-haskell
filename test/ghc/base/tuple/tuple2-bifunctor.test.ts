import tap from 'tap'
import { bifunctor as tupleBifunctor } from 'ghc/base/tuple/tuple2-bifunctor'
import { fst, snd, tuple2, Tuple2Box } from 'ghc/base/tuple/tuple'

const bf = tupleBifunctor()

tap.test('Tuple2 bifunctor', async (t) => {
    t.test('bimap', async (t) => {
        const input: Tuple2Box<number, string> = tuple2(2, 'a')
        const out = bf.bimap(
            (n: number) => n * 3,
            (s: string) => s.toUpperCase(),
            input,
        )

        t.equal(fst(out), 6)
        t.equal(snd(out), 'A')
    })

    t.test('first', async (t) => {
        const input: Tuple2Box<number, string> = tuple2(5, 'x')
        const out = bf.first((n: number) => n + 1, input)

        t.equal(fst(out), 6)
        t.equal(snd(out), 'x')
    })

    t.test('second', async (t) => {
        const input: Tuple2Box<number, string> = tuple2(5, 'x')
        const out = bf.second((s: string) => s + s, input)

        t.equal(fst(out), 5)
        t.equal(snd(out), 'xx')
    })
})
