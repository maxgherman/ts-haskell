import tap from 'tap'
import { compose, id } from 'ghc/base/functions'
import { functor as createFunctor } from 'ghc/base/tuple/tuple2-functor'
import { fst, snd, tuple2, Tuple2Box } from 'ghc/base/tuple/tuple'

const functor = createFunctor<string>()
const fmapId = <T>(fa: Tuple2Box<string, T>) => functor.fmap(id, fa)

tap.test('Tuple2 functor', async (t) => {
    t.test('fmap', async (t) => {
        const result = functor.fmap((x) => x * x, tuple2('test', 3))

        t.equal(fst(result), 'test')
        t.equal(snd(result), 9)
    })

    t.test('<$>', async (t) => {
        const result = functor['<$>']((x: number) => x * x + x / 2, tuple2('test', 3))

        t.equal(fst(result), 'test')
        t.equal(snd(result), 10.5)
    })

    t.test('<$', async (t) => {
        const result = functor['<$'](7, tuple2('test', 3))

        t.equal(fst(result), 'test')
        t.equal(snd(result), 7)
    })

    t.test('$>', async (t) => {
        const result = functor['$>'](tuple2('test', 3), 7)

        t.equal(fst(result), 'test')
        t.equal(snd(result), 7)
    })

    t.test('<&>', async (t) => {
        const result = functor['<&>'](tuple2('test', 3), (x: number) => x * x + x / 2)

        t.equal(fst(result), 'test')
        t.equal(snd(result), 10.5)
    })

    t.test('void', async (t) => {
        const result = functor.void(tuple2('test', 3))

        t.equal(fst(result), 'test')
        t.same(snd(result), [])
    })

    t.test('Functor first law: fmap id = id', async (t) => {
        const argument = tuple2('test', 3)
        const result = fmapId(argument)
        const expected = id(argument)

        t.equal(snd(result), 3)
        t.equal(snd(expected), snd(result))
    })

    t.test('Functor second law: fmap (f . g) = fmap f . fmap g', async (t) => {
        const a = (x: number) => x + 2
        const b = (x: number) => x * 3
        const ab = compose(a, b)
        const fA = (fa: Tuple2Box<string, number>) => functor.fmap(a, fa)
        const fB = (fb: Tuple2Box<string, number>) => functor.fmap(b, fb)
        const fAB = (fab: Tuple2Box<string, number>) => functor.fmap(ab, fab)
        const fAfB = compose(fA, fB)

        const argument = tuple2('test', 3)
        const one = fAB(argument)
        const two = fAfB(argument)

        t.equal(snd(one), 11)
        t.equal(snd(two), 11)
    })
})
