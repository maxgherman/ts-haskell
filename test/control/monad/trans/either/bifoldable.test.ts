import tap from 'tap'
import { Foldable } from 'data/foldable'
import { foldable as maybeFoldable } from 'ghc/base/maybe/foldable'
import { bifoldable as eitherTBifoldable } from 'control/monad/trans/either/bifoldable'
import { monoid as sumMonoid, sum, getSum, SumBox } from 'data/monoid/sum'
import { eitherT } from 'control/monad/trans/either/either-t'
import { left, right, EitherBox } from 'data/either/either'
import { just } from 'ghc/base/maybe/maybe'
import { MinBox1 } from 'data/kind'

const foldable: Foldable = maybeFoldable
const BiFold = eitherTBifoldable(foldable)

tap.test('EitherT BiFoldable aggregates Right values', (t) => {
    const sumMon = sumMonoid()
    const rightValue = eitherT<string, number>(
        () => just(right<string, number>(4)) as unknown as MinBox1<EitherBox<string, number>>,
    )

    const folded = BiFold.bifoldMap(
        sumMon,
        (e: string) => sum(e.length),
        (n: number) => sum(n * 2),
        rightValue,
    ) as unknown as SumBox
    t.equal(getSum(folded), 8)

    const leftValue = eitherT<string, number>(
        () => just(left<string, number>('oops')) as unknown as MinBox1<EitherBox<string, number>>,
    )

    const foldedLeft = BiFold.bifoldMap(
        sumMon,
        (e: string) => sum(e.length),
        (n: number) => sum(n),
        leftValue,
    ) as unknown as SumBox
    t.equal(getSum(foldedLeft), 4)

    const kindResult = (BiFold.kind as unknown as (arg: unknown) => 'Constraint')(() => 'Constraint')
    t.equal(kindResult, 'Constraint')
    t.end()
})
