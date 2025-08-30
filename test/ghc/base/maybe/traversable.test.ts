import tap from 'tap'
import { traversable } from 'ghc/base/maybe/traversable'
import { applicative as maybeApplicative } from 'ghc/base/maybe/applicative'
import { applicative as listApplicative } from 'ghc/base/list/applicative'
import { monad as maybeMonad } from 'ghc/base/maybe/monad'
import { monad as listMonad } from 'ghc/base/list/monad'
import { just, nothing, $case, MaybeBox } from 'ghc/base/maybe/maybe'
import { cons, nil, toArray, ListBox } from 'ghc/base/list/list'

const listOf = <A>(...xs: NonNullable<A>[]) => xs.reduceRight((acc, x) => cons(x)(acc), nil<A>())

const caseMaybe = <A>(mb: MaybeBox<A>, onNothing: () => void, onJust: (a: A) => void) =>
    $case<A, void>({ nothing: onNothing, just: onJust })(mb)

tap.test('Maybe traversable', async (t) => {
    t.test('traverse', async (t) => {
        const res = traversable.traverse(maybeApplicative, (x: number) => just(x + 1), just(3)) as MaybeBox<
            MaybeBox<number>
        >
        caseMaybe(
            res,
            () => t.fail('expected outer just'),
            (inner: MaybeBox<number>) =>
                caseMaybe(
                    inner,
                    () => t.fail('expected inner just'),
                    (v) => t.equal(v, 4),
                ),
        )

        const res2 = traversable.traverse(maybeApplicative, (x: number) => just(x + 1), nothing<number>())
        caseMaybe(
            res2 as MaybeBox<MaybeBox<number>>,
            () => t.fail('expected outer just'),
            (inner: MaybeBox<number>) =>
                caseMaybe(
                    inner,
                    () => t.pass(''),
                    (_a) => t.fail('expected nothing inside'),
                ),
        )
    })

    t.test('mapM', async (t) => {
        const res = traversable.mapM(maybeMonad, (x: number) => just(x + 1), just(3)) as MaybeBox<MaybeBox<number>>
        caseMaybe(
            res,
            () => t.fail('expected outer just'),
            (inner: MaybeBox<number>) =>
                caseMaybe(
                    inner,
                    () => t.fail('expected inner just'),
                    (v) => t.equal(v, 4),
                ),
        )

        const res2 = traversable.mapM(maybeMonad, (x: number) => just(x + 1), nothing<number>()) as MaybeBox<
            MaybeBox<number>
        >
        caseMaybe(
            res2,
            () => t.fail('expected outer just'),
            (inner: MaybeBox<number>) =>
                caseMaybe(
                    inner,
                    () => t.pass(''),
                    () => t.fail('expected nothing inside'),
                ),
        )

        const res3 = traversable.mapM(maybeMonad, (_: number) => nothing<number>(), just(3)) as MaybeBox<
            MaybeBox<number>
        >
        $case<MaybeBox<number>, void>({
            nothing: () => t.pass(''),
            just: () => t.fail('expected nothing'),
        })(res3)
    })

    t.test('sequenceA', async (t) => {
        const tfa1 = just(listOf(1, 2))
        const result1 = traversable.sequenceA(listApplicative, tfa1) as ListBox<MaybeBox<number>>
        t.same(
            toArray(result1).map((m) =>
                caseMaybe(
                    m,
                    () => 'nothing',
                    (v) => `just ${v}`,
                ),
            ),
            ['just 1', 'just 2'],
        )

        const tfa2 = nothing<ListBox<number>>()
        const result2 = traversable.sequenceA(listApplicative, tfa2) as ListBox<MaybeBox<number>>
        t.same(
            toArray(result2).map((m) =>
                caseMaybe(
                    m,
                    () => 'nothing',
                    (v) => `just ${v}`,
                ),
            ),
            ['nothing'],
        )
    })

    t.test('sequence', async (t) => {
        const tfa1 = just(listOf(1, 2))
        const result1 = traversable.sequence(listMonad, tfa1) as ListBox<MaybeBox<number>>
        t.same(
            toArray(result1).map((m) =>
                caseMaybe(
                    m,
                    () => 'nothing',
                    (v) => `just ${v}`,
                ),
            ),
            ['just 1', 'just 2'],
        )

        const tfa2 = nothing<ListBox<number>>()
        const result2 = traversable.sequence(listMonad, tfa2) as ListBox<MaybeBox<number>>
        t.same(
            toArray(result2).map((m) =>
                caseMaybe(
                    m,
                    () => 'nothing',
                    (v) => `just ${v}`,
                ),
            ),
            ['nothing'],
        )
    })
})
