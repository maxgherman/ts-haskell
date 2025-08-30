import tap from 'tap'
import { foldable } from 'ghc/base/list/foldable'
import { cons, nil, toArray, ListBox } from 'ghc/base/list/list'
import { monoid as listMonoid } from 'ghc/base/list/monoid'

const listOf = <A>(...xs: NonNullable<A>[]) => xs.reduceRight((acc, x) => cons(x)(acc), nil<A>())

const listMon = listMonoid<number>()

tap.test('List foldable', (t) => {
    const lst = listOf(1, 2, 3)

    t.equal(
        foldable.foldr((x: number, acc: number) => x + acc, 0, lst),
        6,
    )
    t.equal(
        foldable.foldl((acc: number, x: number) => acc + x, 0, lst),
        6,
    )
    t.equal(
        foldable.foldr1((a: number, b: number) => a + b, lst),
        6,
    )
    t.equal(
        foldable.foldl1((a: number, b: number) => a + b, lst),
        6,
    )
    const mapped = foldable.foldMap(listMon, (x: number) => cons(x)(nil<number>()), lst) as unknown as ListBox<number>
    t.same(toArray(mapped), [1, 2, 3])
    t.same(toArray(foldable.toList(lst)), [1, 2, 3])
    t.equal(foldable.null(lst), false)
    t.equal(foldable.null(nil()), true)
    t.equal(foldable.length(lst), 3)
    t.ok(foldable.elem(2, lst))
    t.notOk(foldable.elem(4, lst))
    t.equal(foldable.maximum(lst), 3)
    t.equal(foldable.sum(lst), 6)
    t.equal(foldable.product(lst), 6)
    t.throws(() => foldable.foldr1((a: number, b: number) => a + b, nil()), {
        message: 'foldr1: empty structure',
    })
    t.throws(() => foldable.foldl1((a: number, b: number) => a + b, nil()), {
        message: 'foldl1: empty structure',
    })
    t.end()
})
