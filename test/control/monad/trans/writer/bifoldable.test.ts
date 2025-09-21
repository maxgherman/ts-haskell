import tap from 'tap'
import { foldable as maybeFoldable } from 'ghc/base/maybe/foldable'
import { bifoldable as writerTBifoldable } from 'control/monad/trans/writer/bifoldable'
import { writerT } from 'control/monad/trans/writer/writer-t'
import { tuple2, Tuple2Box } from 'ghc/base/tuple/tuple'
import { monoid as sumMonoid, sum, getSum, SumBox } from 'data/monoid/sum'
import { just } from 'ghc/base/maybe/maybe'
import { MinBox1 } from 'data/kind'

const BiFold = writerTBifoldable(maybeFoldable)

tap.test('WriterT BiFoldable folds log and value components', (t) => {
    const writerValue = writerT<number, string>(
        () => just(tuple2('ok', 5)) as unknown as MinBox1<Tuple2Box<string, number>>,
    )

    const sumMon = sumMonoid()
    const folded = BiFold.bifoldMap(
        sumMon,
        (log: number) => sum(log),
        (value: string) => sum(value.length),
        writerValue,
    ) as unknown as SumBox
    t.equal(getSum(folded), 7)

    const foldedRight = BiFold.bifoldMap(
        sumMon,
        (log: number) => sum(log * 2),
        (value: string) => sum(value.length * 3),
        writerValue,
    ) as unknown as SumBox
    t.equal(getSum(foldedRight), 16)

    const kindResult = (BiFold.kind as unknown as (arg: unknown) => 'Constraint')(() => 'Constraint')
    t.equal(kindResult, 'Constraint')
    t.end()
})
