import tap from 'tap'
import { foldable1 as neFoldable1 } from 'ghc/base/non-empty/foldable1'
import { cons as neCons } from 'ghc/base/non-empty/list'
import { cons, nil, toArray, ListBox } from 'ghc/base/list/list'
import { semigroup as listSemigroup } from 'ghc/base/list/semigroup'

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
})
