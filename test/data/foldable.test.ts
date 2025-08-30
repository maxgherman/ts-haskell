import tap from 'tap'
import { FoldableBase, foldable } from 'data/foldable'
import { monoid as listMonoid } from 'ghc/base/list/monoid'
import { cons, nil, head, tail, $null, toArray, ListBox } from 'ghc/base/list/list'

const base: FoldableBase = {
    foldr: <A, B>(f: (a: A, b: B) => B, b: B, fa: ListBox<A>): B => {
        if ($null(fa)) {
            return b
        }
        return f(head(fa), base.foldr(f, b, tail(fa)))
    },
}

const listOf = <A>(...xs: NonNullable<A>[]) => xs.reduceRight((acc, x) => cons(x)(acc), nil<A>())

const fold = foldable(base)

const listMon = listMonoid<number>()

tap.test('Foldable base', (t) => {
    const lst = listOf(1, 2, 3)
    t.equal(
        fold.foldr((x: number, acc: number) => x + acc, 0, lst),
        6,
    )
    t.equal(
        fold.foldl((acc: number, x: number) => acc + x, 0, lst),
        6,
    )
    t.equal(
        fold.foldr1((a: number, b: number) => a + b, lst),
        6,
    )
    t.equal(
        fold.foldl1((a: number, b: number) => a + b, lst),
        6,
    )
    const mapped = fold.foldMap(listMon, (x: number) => cons(x)(nil<number>()), lst) as unknown as ListBox<number>
    t.same(toArray(mapped), [1, 2, 3])
    const mappedPrime = fold["foldMap'"](
        listMon,
        (x: number) => cons(x)(nil<number>()),
        lst,
    ) as unknown as ListBox<number>
    t.same(toArray(mappedPrime), [1, 2, 3])
    t.equal(
        fold["foldr'"]((x: number, acc: number) => x + acc, 0, lst),
        6,
    )
    t.equal(
        fold["foldl'"]((acc: number, x: number) => acc + x, 0, lst),
        6,
    )
    const nested = listOf<ListBox<number>>(listOf(1), listOf(2, 3))
    const folded = fold.fold(listMon, nested) as unknown as ListBox<number>
    t.same(toArray(folded), [1, 2, 3])
    t.same(toArray(fold.toList(lst)), [1, 2, 3])
    t.same(toArray(fold.toList(nil())), [])
    t.equal(fold.null(lst), false)
    t.equal(fold.null(nil()), true)
    t.equal(fold.length(lst), 3)
    t.equal(fold.length(nil()), 0)
    t.ok(fold.elem(2, lst))
    t.notOk(fold.elem(4, lst))
    t.notOk(fold.elem(1, nil()))
    t.equal(fold.maximum(lst), 3)
    const lstDesc = listOf(3, 2, 1)
    t.equal(fold.maximum(lstDesc), 3)
    t.equal(fold.sum(lst), 6)
    t.equal(fold.sum(nil()), 0)
    t.equal(fold.product(lst), 6)
    t.equal(fold.product(nil()), 1)
    t.equal(
        fold.kind((_) => '*'),
        'Constraint',
    )
    t.throws(() => fold.foldr1((a: number, b: number) => a + b, nil()), {
        message: 'foldr1: empty structure',
    })
    t.throws(() => fold.foldl1((a: number, b: number) => a + b, nil()), {
        message: 'foldl1: empty structure',
    })
    t.throws(() => fold.maximum(nil()), { message: 'maximum: empty structure' })
    t.end()
})
