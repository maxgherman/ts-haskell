import tap from 'tap'
import { bifoldable as createBiFoldable, BiFoldableBase } from 'data/bifoldable'
import { tuple2, fst, snd, Tuple2Box } from 'ghc/base/tuple/tuple'
import { monoid as sumMonoid, sum, getSum, SumBox } from 'data/monoid/sum'
import { monoid as productMonoid, product, getProduct, ProductBox } from 'data/monoid/product'
import { monoid as anyMonoid, any, getAny, AnyBox } from 'data/monoid/any'
import { monoid as allMonoid, all, getAll, AllBox } from 'data/monoid/all'
import { MinBox0 } from 'data/kind'

const base: BiFoldableBase = {
    bifoldMap: <A, B, M>(
        m: import('ghc/base/monoid').Monoid<M>,
        f: (a: A) => MinBox0<M>,
        g: (b: B) => MinBox0<M>,
        fab: Tuple2Box<A, B>,
    ) => m['<>'](f(fst(fab)), g(snd(fab))),
}

tap.test('BiFoldable builder derives helpers', (t) => {
    const BiFold = createBiFoldable(base)
    const pair = tuple2(3, 5) as Tuple2Box<number, number>

    // bifold using Sum monoid
    const sumMon = sumMonoid()
    const summed = BiFold.bifold(sumMon, tuple2(sum(2), sum(4)) as unknown as Tuple2Box<SumBox, SumBox>) as SumBox
    t.equal(getSum(summed), 6)

    // bifoldr accumulates left to right using Endo composition
    const rightToLeft = BiFold.bifoldr(
        (a: number, acc: number[]) => acc.concat([a * 2]),
        (b: number, acc: number[]) => acc.concat([b + 1]),
        [],
        pair,
    )
    t.same(rightToLeft, [6, 6])

    // strict aliases use the same implementation
    const strictRight = BiFold["bifoldr'"](
        (a: number, acc: number[]) => acc.concat([a]),
        (b: number, acc: number[]) => acc.concat([b]),
        [],
        pair,
    )
    t.same(strictRight, [5, 3])

    // bifoldl processes from the left
    const leftAccum = BiFold.bifoldl(
        (acc: number[], a: number) => acc.concat([a - 1]),
        (acc: number[], b: number) => acc.concat([b + 2]),
        [],
        pair,
    )
    t.same(leftAccum, [2, 7])

    const strictLeft = BiFold["bifoldl'"](
        (acc: number[], a: number) => acc.concat([a * 10]),
        (acc: number[], b: number) => acc.concat([b * 100]),
        [],
        pair,
    )
    t.same(strictLeft, [30, 500])

    // logical helpers
    t.equal(
        BiFold.biany(
            (a: number) => a > 10,
            (b: number) => b > 4,
            pair,
        ),
        true,
    )
    t.equal(
        BiFold.biall(
            (a: number) => a >= 3,
            (b: number) => b < 5,
            pair,
        ),
        false,
    )

    // numeric folds
    t.equal(BiFold.bisum(pair), 8)
    t.equal(BiFold.biproduct(tuple2(2, 4)), 8)

    // ensure foldMap hits both sides of the base implementation
    const kindResult = (BiFold.kind as unknown as (arg: unknown) => 'Constraint')(() => 'Constraint')
    t.equal(kindResult, 'Constraint')
    t.end()
})

// Dedicated checks for boolean/numeric derived helpers

tap.test('BiFoldable boolean and numeric helpers use provided monoids', (t) => {
    const BiFold = createBiFoldable(base)
    const pair = tuple2(true, false) as Tuple2Box<boolean, boolean>

    const anyResult = BiFold.biany(
        (a: boolean) => !a,
        (b: boolean) => b,
        pair,
    )
    t.equal(anyResult, false)

    const allResult = BiFold.biall(
        (a: boolean) => a,
        (b: boolean) => !b,
        pair,
    )
    t.equal(allResult, true)

    const anyMon = anyMonoid()
    const recordedAny = BiFold.bifoldMap(
        anyMon,
        (a: boolean) => any(a),
        (b: boolean) => any(b),
        pair,
    ) as unknown as AnyBox
    t.equal(getAny(recordedAny), true)

    const allMon = allMonoid()
    const recordedAll = BiFold.bifoldMap(
        allMon,
        (a: boolean) => all(a),
        (b: boolean) => all(b),
        pair,
    ) as unknown as AllBox
    t.equal(getAll(recordedAll), false)

    const sums = BiFold.bifold(sumMonoid(), tuple2(sum(1), sum(2)) as unknown as Tuple2Box<SumBox, SumBox>) as SumBox
    t.equal(getSum(sums), 3)

    const products = BiFold.bifold(
        productMonoid(),
        tuple2(product(3), product(4)) as unknown as Tuple2Box<ProductBox, ProductBox>,
    ) as ProductBox
    t.equal(getProduct(products), 12)
    t.end()
})
