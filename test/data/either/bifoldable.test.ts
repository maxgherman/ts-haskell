import tap from 'tap'
import { left, right, EitherBox } from 'data/either/either'
import { bifoldable as eitherBiFoldable } from 'data/either/bifoldable'
import { monoid as sumMonoid, sum, getSum, SumBox } from 'data/monoid/sum'
import { monoid as productMonoid, product, getProduct, ProductBox } from 'data/monoid/product'

const BiFold = eitherBiFoldable()

tap.test('Either BiFoldable maps Left and Right independently', (t) => {
    const sumMon = sumMonoid()
    const resultLeft = BiFold.bifoldMap(
        sumMon,
        (n: number) => sum(n),
        (n: number) => sum(n * 10),
        left<number, number>(3) as EitherBox<number, number>,
    ) as unknown as SumBox
    t.equal(getSum(resultLeft), 3)

    const resultRight = BiFold.bifoldMap(
        sumMon,
        (n: number) => sum(n),
        (n: number) => sum(n * 10),
        right<number, number>(4) as EitherBox<number, number>,
    ) as unknown as SumBox
    t.equal(getSum(resultRight), 40)

    const bothFold = BiFold.bifold(
        productMonoid(),
        right<ProductBox, ProductBox>(product(5)) as EitherBox<ProductBox, ProductBox>,
    ) as ProductBox
    t.equal(getProduct(bothFold), 5)

    const kindResult = (BiFold.kind as unknown as (arg: unknown) => 'Constraint')(() => 'Constraint')
    t.equal(kindResult, 'Constraint')
    t.end()
})
