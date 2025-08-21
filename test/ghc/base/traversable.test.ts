import tap from 'tap'
import type { Test } from 'tap'
import { kindOf, Traversable, traversable as createTraversable } from 'data/traversable'
import { traversable as listTraversable } from 'ghc/base/list/traversable'
import { functor as listFunctor } from 'ghc/base/list/functor'
import { foldable as listFoldable } from 'ghc/base/list/foldable'
import { cons, nil, toArray, ListBox } from 'ghc/base/list/list'
import { applicative as maybeApplicative } from 'ghc/base/maybe/applicative'
import { just, nothing, $case, MaybeBox } from 'ghc/base/maybe/maybe'

tap.test('traversable', async () => {
    tap.test('kindOf', async (t) => {
        const kind = kindOf({} as Traversable) as Function
        const result = kind({} as (_: '*') => '*')
        t.equal(result, 'Constraint')
    })

    const listOf = <A>(...xs: NonNullable<A>[]) => xs.reduceRight((acc, x) => cons(x)(acc), nil<A>())

    const caseMaybe = <A>(t: Test, mb: MaybeBox<A>, onJust: (a: A) => void) =>
        $case<A, void>({
            nothing: () => t.fail('expected just'),
            just: onJust,
        })(mb)

    tap.test('sequenceA derived from traverse', async (t) => {
        const base = { traverse: listTraversable.traverse }
        const tOnlyTraverse = createTraversable(base, listFunctor, listFoldable)

        const tfa1 = listOf(just(1), just(2))
        const res1 = tOnlyTraverse.sequenceA(maybeApplicative, tfa1) as MaybeBox<ListBox<number>>
        caseMaybe(t, res1, (lst: ListBox<number>) => t.same(toArray(lst), [1, 2]))

        const tfa2 = listOf(just(1), nothing<number>())
        const res2 = tOnlyTraverse.sequenceA(maybeApplicative, tfa2) as MaybeBox<ListBox<number>>
        $case<void, void>({
            nothing: () => t.pass(''),
            just: () => t.fail('expected nothing'),
        })(res2)
    })
})
