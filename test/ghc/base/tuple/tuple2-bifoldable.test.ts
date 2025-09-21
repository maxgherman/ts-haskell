import tap from 'tap'
import { tuple2, Tuple2Box } from 'ghc/base/tuple/tuple'
import { bifoldable as tupleBiFoldable } from 'ghc/base/tuple/tuple2-bifoldable'
import { monoid as sumMonoid, sum, getSum, SumBox } from 'data/monoid/sum'
import { monoid as productMonoid, product, getProduct, ProductBox } from 'data/monoid/product'

const BiFold = tupleBiFoldable()

tap.test('Tuple2 BiFoldable folds both positions', (t) => {
    const pair = tuple2(2, 3) as Tuple2Box<number, number>

    const sumResult = BiFold.bifold(
        sumMonoid(),
        tuple2(sum(4), sum(5)) as unknown as Tuple2Box<SumBox, SumBox>,
    ) as SumBox
    t.equal(getSum(sumResult), 9)

    const listFromRight = BiFold.bifoldr(
        (a: number, acc: number[]) => acc.concat([a]),
        (b: number, acc: number[]) => acc.concat([b]),
        [],
        pair,
    )
    t.same(listFromRight, [3, 2])

    const listFromLeft = BiFold.bifoldl(
        (acc: number[], a: number) => acc.concat([a * 10]),
        (acc: number[], b: number) => acc.concat([b * 100]),
        [],
        pair,
    )
    t.same(listFromLeft, [20, 300])

    t.equal(
        BiFold.biany(
            (a: number) => a === 2,
            (b: number) => b === 4,
            pair,
        ),
        true,
    )
    t.equal(
        BiFold.biall(
            (a: number) => a > 1,
            (b: number) => b > 1,
            pair,
        ),
        true,
    )

    t.equal(BiFold.bisum(pair), 5)
    t.equal(BiFold.biproduct(pair), 6)

    const productFold = BiFold.bifold(
        productMonoid(),
        tuple2(product(3), product(7)) as unknown as Tuple2Box<ProductBox, ProductBox>,
    ) as ProductBox
    t.equal(getProduct(productFold), 21)

    t.end()
})

tap.test('Tuple2 BiFoldable preserves kind function', (t) => {
    const kindResult = (BiFold.kind as unknown as (arg: unknown) => 'Constraint')(() => 'Constraint')
    t.equal(kindResult, 'Constraint')
    t.end()
})
