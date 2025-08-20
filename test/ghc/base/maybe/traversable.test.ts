import tap from 'tap'
import { traversable } from 'ghc/base/maybe/traversable'
import { applicative as maybeApplicative } from 'ghc/base/maybe/applicative'
import { applicative as listApplicative } from 'ghc/base/list/applicative'
import { just, nothing, $case, MaybeBox } from 'ghc/base/maybe/maybe'
import { cons, nil, toArray, ListBox } from 'ghc/base/list/list'

const listOf = <A>(...xs: A[]) => xs.reduceRight((acc, x) => cons(x)(acc), nil<A>())

const caseMaybe = <A>(mb: MaybeBox<A>, onNothing: () => void, onJust: (a: A) => void) =>
    $case<A, void>({ nothing: onNothing, just: onJust })(mb)

tap.test('Maybe traversable', async (t) => {
    t.test('traverse', async (t) => {
        const res = traversable.traverse(maybeApplicative, (x: number) => just(x + 1), just(3))
        caseMaybe(
            res,
            () => t.fail('expected outer just'),
            (inner) => caseMaybe(inner, () => t.fail('expected inner just'), (v) => t.equal(v, 4)),
        )

        const res2 = traversable.traverse(maybeApplicative, (x: number) => just(x + 1), nothing())
        caseMaybe(
            res2,
            () => t.fail('expected outer just'),
            (inner) => caseMaybe(inner, () => t.pass(''), () => t.fail('expected nothing inside')),
        )
    })

    t.test('sequenceA', async (t) => {
        const tfa1 = just(listOf(1, 2))
        const result1 = traversable.sequenceA(listApplicative, tfa1) as ListBox<MaybeBox<number>>
        t.same(
            toArray(result1).map((m) =>
                caseMaybe(m, () => 'nothing', (v) => `just ${v}`),
            ),
            ['just 1', 'just 2'],
        )

        const tfa2 = nothing<ListBox<number>>()
        const result2 = traversable.sequenceA(listApplicative, tfa2) as ListBox<MaybeBox<number>>
        t.same(
            toArray(result2).map((m) =>
                caseMaybe(m, () => 'nothing', (v) => `just ${v}`),
            ),
            ['nothing'],
        )
    })
})
