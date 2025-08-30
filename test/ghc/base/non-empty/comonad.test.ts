import tap from 'tap'
import { comonad } from 'ghc/base/non-empty/comonad'
import { cons, fromList, NonEmptyBox, toList } from 'ghc/base/non-empty/list'
import { cons as listCons, ListBox, nil, toArray } from 'ghc/base/list/list'

const cm = comonad

const createList = (value: number[]): ListBox<number> =>
    value.reduceRight((acc, curr) => listCons(curr)(acc), nil<number>())

const createNonEmpty = (value: number[]): NonEmptyBox<number> => fromList(createList(value))

tap.test('NonEmpty Comonad', async (t) => {
    const ne = createNonEmpty([1, 2, 3])

    t.test('extract', async (t) => {
        t.equal(cm.extract(ne), 1)
    })

    t.test('extend', async (t) => {
        const f = (xs: NonEmptyBox<number>) => cm.extract(xs) + 1
        const extended = cm.extend(f, ne)
        t.same(toArray(toList(extended)), [2, 3, 4])
    })

    t.test('duplicate', async (t) => {
        const dup = cm.duplicate(ne)
        const result = toArray(toList(dup)).map((x) => toArray(toList(x as NonEmptyBox<number>)))
        t.same(result, [[1, 2, 3], [2, 3], [3]])
    })
})
