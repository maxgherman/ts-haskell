import tap from 'tap'
import { compose, id } from 'ghc/base/functions'
import { PromiseBox } from 'extra/promise/promise'
import { functor } from 'extra/promise/functor'

tap.test('Promise functor', async (t) => {
    t.test('fmap', async (t) => {
        const part1 = Promise.resolve(3) as PromiseBox<number>
        const result = functor.fmap((x: number) => x * x + Math.pow(x, 2), part1)

        await result.then((data) => {
            t.equal(data, 18)
        })
    })

    t.test('<$>', async (t) => {
        const part1 = Promise.resolve(3) as PromiseBox<number>
        const result = functor['<$>']((x: number) => x * x + x / 2, part1)

        await result.then((data) => {
            t.equal(data, 10.5)
        })
    })

    t.test('<$', async (t) => {
        const part1 = Promise.resolve(3) as PromiseBox<number>
        const result = functor['<$'](7, part1)

        await result.then((data) => {
            t.equal(data, 7)
        })
    })

    t.test('$>', async (t) => {
        const part1 = Promise.resolve(3) as PromiseBox<number>
        const result = functor['$>'](part1, 7)

        await result.then((data) => {
            t.equal(data, 7)
        })
    })

    t.test('<&>', async (t) => {
        const part1 = Promise.resolve(3) as PromiseBox<number>
        const result = functor['<&>'](part1, (x: number) => x * x + x / 2)

        await result.then((data) => {
            t.equal(data, 10.5)
        })
    })

    t.test('void', async (t) => {
        const part1 = Promise.resolve(3) as PromiseBox<number>
        const result = functor.void(part1)

        await result.then((data) => {
            t.same(data, [])
        })
    })

    t.test('Functor first law: fmap id = id', async (t) => {
        const fmapId = (fa: PromiseBox<number>): PromiseBox<number> => functor.fmap<number, number>(id, fa)
        const part1 = Promise.resolve(3) as PromiseBox<number>

        const result = fmapId(part1)
        const expected = id(part1)

        await Promise.all([result, expected]).then(([result, expected]) => {
            t.equal(result, 3)
            t.equal(result, expected)
        })
    })

    t.test('Functor second law: fmap (f . g) = fmap f . fmap g', async (t) => {
        const part1 = Promise.resolve(3) as PromiseBox<number>
        const a = (x: number) => x + 2
        const b = (x: number) => x * 3
        const ab = compose(a, b)
        const fA = (fa: PromiseBox<number>) => functor.fmap(a, fa)
        const fB = (fb: PromiseBox<number>) => functor.fmap(b, fb)
        const fAB = (fab: PromiseBox<number>) => functor.fmap(ab, fab)
        const fAfB = compose(fA, fB)

        const one = fAB(part1)
        const two = fAfB(part1)

        await Promise.all([one, two]).then(([one, two]) => {
            t.equal(one, 11)
            t.equal(one, two)
        })
    })
})
