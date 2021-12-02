import tap from 'tap'
import { compose, id } from 'ghc/base/functions'
import { cons, head, ListBox, nil, tail, toArray } from 'ghc/base/list/list'
import { functor } from 'ghc/base/list/functor'

const empty = nil<number>()
const list3 = cons(3)(nil())

tap.test('List functor', async (t) => {
    t.test('fmap', async (t) => {
        const result = functor.fmap((x: number) => x * x + Math.pow(x, 2), list3)

        t.equal(head(result), 18)
        t.same(toArray(tail(result)), [])
    })

    t.test('<$>', async (t) => {
        const result = functor['<$>']((x: number) => x * x + x / 2, list3)
        t.equal(head(result), 10.5)
    })

    t.test('<$', async (t) => {
        const result = functor['<$'](7, list3)
        t.equal(head(result), 7)
    })

    t.test('$>', async (t) => {
        const result = functor['$>'](list3, 7)
        t.equal(head(result), 7)
    })

    t.test('<&>', async (t) => {
        const result = functor['<&>'](list3, (x: number) => x * x + x / 2)
        t.equal(head(result), 10.5)
    })

    t.test('void', async (t) => {
        const result = functor.void(list3)
        t.same(head(result), [])
    })

    t.test('Functor first law: fmap id = id', async (t) => {
        const fmapId = (fa: ListBox<number>): ListBox<number> => functor.fmap<number, number>(id, fa)

        t.test('empty', async (t) => {
            const result = fmapId(empty)
            const expected = id(empty)

            t.same(toArray(result), [])
            t.same(toArray(result), toArray(expected))
        })

        t.test('non - empty', async (t) => {
            const result = fmapId(list3)
            const expected = id(list3)

            t.equal(head(result), 3)
            t.equal(head(result), head(expected))
        })
    })

    t.test('Functor second law: fmap (f . g) = fmap f . fmap g', async (t) => {
        const a = (x: number) => x + 2
        const b = (x: number) => x * 3
        const ab = compose(a, b)
        const fA = (fa: ListBox<number>) => functor.fmap(a, fa)
        const fB = (fb: ListBox<number>) => functor.fmap(b, fb)
        const fAB = (fab: ListBox<number>) => functor.fmap(ab, fab)
        const fAfB = compose(fA, fB)

        t.test('empty', async (t) => {
            const one = fAB(empty)
            const two = fAfB(empty)

            t.same(toArray(one), [])
            t.same(toArray(two), [])
        })

        t.test('non - empty', async (t) => {
            const one = fAB(list3)
            const two = fAfB(list3)

            t.equal(head(one), 11)
            t.equal(head(one), head(two))
        })
    })
})
