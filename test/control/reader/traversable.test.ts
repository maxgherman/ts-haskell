import tap from 'tap'
import type { Test } from 'tap'
import { traversable } from 'control/reader/traversable'
import { reader } from 'control/reader/reader'
import { applicative as maybeApplicative } from 'ghc/base/maybe/applicative'
import { monad as maybeMonad } from 'ghc/base/maybe/monad'
import { just, nothing, $case, MaybeBox } from 'ghc/base/maybe/maybe'
import type { ReaderBox } from 'control/reader/reader'

const caseMaybe = <A>(t: Test, mb: MaybeBox<A>, onJust: (a: A) => void) =>
    $case<A, void>({ nothing: () => t.fail('expected just'), just: onJust })(mb)

tap.test('Reader traversable', async (t) => {
    t.test('traverse', async (t) => {
        const r = reader(() => 5)
        const res = traversable<unknown>().traverse(maybeApplicative, (x: number) => just(x + 1), r) as MaybeBox<
            ReaderBox<unknown, number>
        >
        caseMaybe(t, res, (rr) => t.equal(rr.runReader(undefined as unknown), 6))

        const res2 = traversable<unknown>().traverse(maybeApplicative, (_: number) => nothing<number>(), r)
        $case<ReaderBox<unknown, number>, void>({ nothing: () => t.pass(''), just: () => t.fail('expected nothing') })(
            res2 as MaybeBox<ReaderBox<unknown, number>>,
        )
    })

    t.test('mapM', async (t) => {
        const r = reader(() => 5)
        const res = traversable<unknown>().mapM(maybeMonad, (x: number) => just(x + 1), r) as MaybeBox<
            ReaderBox<unknown, number>
        >
        caseMaybe(t, res, (rr) => t.equal(rr.runReader(undefined as unknown), 6))

        const res2 = traversable<unknown>().mapM(maybeMonad, (_: number) => nothing<number>(), r)
        $case<ReaderBox<unknown, number>, void>({ nothing: () => t.pass(''), just: () => t.fail('expected nothing') })(
            res2 as MaybeBox<ReaderBox<unknown, number>>,
        )
    })

    t.test('sequenceA', async (t) => {
        const r = reader(() => just(5))
        const res = traversable<unknown>().sequenceA(maybeApplicative, r) as MaybeBox<ReaderBox<unknown, number>>
        caseMaybe(t, res, (rr) => t.equal(rr.runReader(undefined as unknown), 5))
    })

    t.test('sequence', async (t) => {
        const r = reader(() => just(5))
        const res = traversable<unknown>().sequence(maybeMonad, r) as MaybeBox<ReaderBox<unknown, number>>
        caseMaybe(t, res, (rr) => t.equal(rr.runReader(undefined as unknown), 5))
    })
})
