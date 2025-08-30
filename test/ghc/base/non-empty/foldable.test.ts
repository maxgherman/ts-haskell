import tap from 'tap'
import { foldable } from 'ghc/base/non-empty/foldable'
import { cons as listCons, nil as listNil, toArray } from 'ghc/base/list/list'
import { formList, NonEmptyBox, toList } from 'ghc/base/non-empty/list'

const listOf = <A>(...xs: NonNullable<A>[]) => xs.reduceRight((acc, x) => listCons(x)(acc), listNil<A>())

tap.test('NonEmpty foldable', (t) => {
    const ne = formList(listOf(1, 2, 3)) as NonEmptyBox<number>

    t.equal(
        foldable.foldr((x: number, acc: number) => x + acc, 0, ne),
        6,
    )
    t.equal(
        foldable.foldl((acc: number, x: number) => acc + x, 0, ne),
        6,
    )
    t.same(toArray(foldable.toList(ne)), [1, 2, 3])
    t.equal(foldable.length(ne), 3)
    t.notOk(foldable.null(ne))
    t.ok(foldable.elem(2, ne))
    t.equal(foldable.sum(ne), 6)
    t.equal(foldable.product(ne), 6)
    t.end()
})
