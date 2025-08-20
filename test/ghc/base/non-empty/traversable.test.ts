import tap from 'tap'
import type { Test } from 'tap'
import { traversable } from 'ghc/base/non-empty/traversable'
import { applicative as maybeApplicative } from 'ghc/base/maybe/applicative'
import { just, nothing, $case, MaybeBox } from 'ghc/base/maybe/maybe'
import { cons as listCons, nil as listNil, toArray } from 'ghc/base/list/list'
import { formList, NonEmptyBox, toList } from 'ghc/base/non-empty/list'

const listOf = <A>(...xs: NonNullable<A>[]) =>
    xs.reduceRight((acc, x) => listCons(x)(acc), listNil<A>())

const caseMaybe = <A>(t: Test, mb: MaybeBox<A>, onJust: (a: A) => void) =>
    $case<A, void>({ nothing: () => t.fail('expected just'), just: onJust })(mb)

tap.test('NonEmpty traversable', async (t) => {
    t.test('sequenceA', async (t) => {
        const tfa = formList(listOf(just(1), just(2))) as NonEmptyBox<MaybeBox<number>>
        const res = traversable.sequenceA(maybeApplicative, tfa) as MaybeBox<NonEmptyBox<number>>
        caseMaybe(t, res, (ne: NonEmptyBox<number>) => t.same(toArray(toList(ne)), [1, 2]))

        const tfa2 = formList(listOf(just(1), nothing<number>())) as NonEmptyBox<MaybeBox<number>>
        const res2 = traversable.sequenceA(maybeApplicative, tfa2) as MaybeBox<NonEmptyBox<number>>
        $case<NonEmptyBox<number>, void>({
            nothing: () => t.pass(''),
            just: () => t.fail('expected nothing'),
        })(res2)
    })
})
