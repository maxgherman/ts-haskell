import tap from 'tap'
import { compose, id } from 'ghc/base/functions'
import { cons, nil, toArray } from 'ghc/base/list/list'
import { formList, head, NonEmptyBox, tail, toList } from 'ghc/base/non-empty/list'
import { functor } from 'ghc/base/non-empty/functor'

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
        const list = compose(formList, cons(3), cons(2), cons(1))(nil<number>())

        t.test('non - empty', async (t) => {
            const result = fmapId(list)
            const expected = id(list)

            t.same(toArray(toList(result)), [3, 2, 1])
            t.same(toArray(toList(result)), toArray(toList(expected)))
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
        const list = compose(formList, cons(3), cons(2), cons(1))(nil<number>())

        t.test('non - empty', async (t) => {
            const one = fAB(list)
            const two = fAfB(list)

            t.same(toArray(toList(one)), [11, 8, 5])
            t.same(toArray(toList(one)), toArray(toList(two)))
        })
    })
})
