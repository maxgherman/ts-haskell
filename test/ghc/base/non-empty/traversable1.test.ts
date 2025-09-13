import tap from 'tap'
import { traversable1 as neTraversable1 } from 'ghc/base/non-empty/traversable1'
import { cons as neCons, NonEmptyBox } from 'ghc/base/non-empty/list'
import { apply as maybeApply } from 'ghc/base/maybe/apply'
import { $case as maybeCase, just, nothing, MaybeBox } from 'ghc/base/maybe/maybe'
import { nil, cons } from 'ghc/base/list/list'

const inspect = <T>(m: MaybeBox<T>) =>
    maybeCase<T, string>({
        nothing: () => 'N',
        just: () => 'J',
    })(m)

tap.test('NonEmpty Traversable1', async (t) => {
    const nonEmpty = neCons<number>(1)(cons<number>(2)(nil<number>()))

    t.test('Just', (t) => {
        const result = neTraversable1.traverse1<number, number>(maybeApply, (x) => just(x + 1), nonEmpty) as MaybeBox<
            NonEmptyBox<number>
        >

        t.equal(inspect(result), 'J')
        t.end()
    })

    t.test('Nothing', (t) => {
        const result = neTraversable1.traverse1<number, number>(
            maybeApply,
            (x) => (x > 1 ? (nothing<number>() as MaybeBox<number>) : just(x)),
            nonEmpty,
        ) as MaybeBox<NonEmptyBox<number>>

        t.equal(inspect(result), 'N')
        t.end()
    })
})
