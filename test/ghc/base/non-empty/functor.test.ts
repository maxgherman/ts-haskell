import tap from 'tap'
import { compose, id } from 'ghc/base/functions'
import { cons, nil, toArray } from 'ghc/base/list/list'
import { formList, head, NonEmptyBox, tail } from 'ghc/base/non-empty/list'
import { functor } from 'ghc/base/non-empty/list-functor'

const nonEmpty3: NonEmptyBox<number> = compose(formList, cons(3))(nil<number>())

tap.test('NonEmpty functor', async (t) => {
    t.test('fmap', async (t) => {
        const result = functor.fmap((x: number) => x * x + Math.pow(x, 2), nonEmpty3)

        t.equal(head(result), 18)
        t.same(toArray(tail(result)), [])
    })

    t.test('<$>', async (t) => {
        const result = functor['<$>']((x: number) => x * x + x / 2, nonEmpty3)
        t.equal(head(result), 10.5)
    })

    t.test('<$', async (t) => {
        const result = functor['<$'](7, nonEmpty3)
        t.equal(head(result), 7)
    })

    t.test('$>', async (t) => {
        const result = functor['$>'](nonEmpty3, 7)
        t.equal(head(result), 7)
    })

    t.test('<&>', async (t) => {
        const result = functor['<&>'](nonEmpty3, (x: number) => x * x + x / 2)
        t.equal(head(result), 10.5)
    })

    t.test('void', async (t) => {
        const result = functor.void(nonEmpty3)
        t.same(head(result), [])
    })

    t.test('Functor first law: fmap id = id', async (t) => {
        const fmapId = (fa: NonEmptyBox<number>): NonEmptyBox<number> => functor.fmap<number, number>(id, fa)

        t.test('non - empty', async (t) => {
            const result = fmapId(nonEmpty3)
            const expected = id(nonEmpty3)

            t.equal(head(result), 3)
            t.equal(head(result), head(expected))
        })
    })

    t.test('Functor second law: fmap (f . g) = fmap f . fmap g', async (t) => {
        const a = (x: number) => x + 2
        const b = (x: number) => x * 3
        const ab = compose(a, b)
        const fA = (fa: NonEmptyBox<number>) => functor.fmap(a, fa)
        const fB = (fb: NonEmptyBox<number>) => functor.fmap(b, fb)
        const fAB = (fab: NonEmptyBox<number>) => functor.fmap(ab, fab)
        const fAfB = compose(fA, fB)

        t.test('non - empty', async (t) => {
            const one = fAB(nonEmpty3)
            const two = fAfB(nonEmpty3)

            t.equal(head(one), 11)
            t.equal(head(one), head(two))
        })
    })
})
