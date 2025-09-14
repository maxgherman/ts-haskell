import tap from 'tap'
import { foldable1 as neFoldable1 } from 'ghc/base/non-empty/foldable1'
import { cons as neCons } from 'ghc/base/non-empty/list'
import { cons, nil, toArray, ListBox } from 'ghc/base/list/list'
import { semigroup as listSemigroup } from 'ghc/base/list/semigroup'
import { semigroup as createSemigroup } from 'ghc/base/semigroup'
import type { MinBox0 } from 'data/kind'

tap.test('NonEmpty Foldable1', async (t) => {
    const semigroup = listSemigroup<number>()

    const nonEmpty = neCons<number>(1)(cons<number>(2)(cons<number>(3)(nil<number>())))

    t.test('Single element list', (t) => {
        const result = neFoldable1.fold1<ListBox<number>>(
            semigroup,
            neCons<ListBox<number>>(cons<number>(4)(nil<number>()))(nil<ListBox<number>>()),
        )

        t.same(toArray(result as unknown as ListBox<number>), [4])
        t.end()
    })

    t.test('Multi element list', (t) => {
        const r = neFoldable1.foldMap1<number, ListBox<number>>(
            semigroup,
            (x) => cons<number>(x)(nil<number>()) as unknown as ListBox<number>,
            nonEmpty,
        )

        t.same(toArray(r as unknown as ListBox<number>), [1, 2, 3])
        t.end()
    })

    t.test('foldMap1 calls combine for each tail element', (t) => {
        let combineCalls = 0
        const countingSemigroup = createSemigroup<number>({
            '<>': (a: MinBox0<number>, b: MinBox0<number>) => {
                combineCalls += 1
                return ((a as unknown as number) + (b as unknown as number)) as unknown as MinBox0<number>
            },
        })

        const three = neCons<number>(10)(cons<number>(20)(cons<number>(30)(nil<number>())))
        const result = neFoldable1.foldMap1<number, number>(
            countingSemigroup,
            (x) => x as unknown as MinBox0<number>,
            three,
        )

        t.equal(result as unknown as number, 60)
        // Head is 10, tail has 2 elements -> two combinations occur
        t.equal(combineCalls, 2)
        t.end()
    })
})
