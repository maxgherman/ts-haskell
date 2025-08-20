import tap from 'tap'
import type { Test } from 'tap'
import { traversable } from 'ghc/base/list/traversable'
import { applicative as maybeApplicative } from 'ghc/base/maybe/applicative'
import { just, nothing, $case, MaybeBox } from 'ghc/base/maybe/maybe'
import { cons, nil, toArray, ListBox } from 'ghc/base/list/list'

const listOf = <A>(...xs: NonNullable<A>[]) =>
    xs.reduceRight((acc, x) => cons(x)(acc), nil<A>())

const caseMaybe = <A>(t: Test, mb: MaybeBox<A>, onJust: (a: A) => void) =>
    $case<A, void>({
        nothing: () => t.fail('expected just'),
        just: onJust,
    })(mb)

tap.test('List traversable', async (t) => {
    t.test('sequenceA', async (t) => {
        const tfa1 = listOf(just(1), just(2))
        const result1 = traversable.sequenceA(maybeApplicative, tfa1) as MaybeBox<ListBox<number>>
        caseMaybe(t, result1, (lst: ListBox<number>) => t.same(toArray(lst), [1, 2]))

        const tfa2 = listOf(just(1), nothing<number>())
        const result2 = traversable.sequenceA(maybeApplicative, tfa2) as MaybeBox<ListBox<number>>
        $case<void, void>({
            nothing: () => t.pass(''),
            just: () => t.fail('expected nothing'),
        })(result2)
    })

    t.test('traverse', async (t) => {
          const lst = listOf(1, 2)
          const res =
              traversable.traverse(maybeApplicative, (x: number) => just(x + 1), lst) as MaybeBox<ListBox<number>>
          caseMaybe(t, res, (lst: ListBox<number>) => t.same(toArray(lst), [2, 3]))
    })

    t.test('sequenceA = traverse id', async (t) => {
          const tfa = listOf(just(1), just(2))
          const seq = traversable.sequenceA(maybeApplicative, tfa) as MaybeBox<ListBox<number>>
          const trav = traversable.traverse(
              maybeApplicative,
              (x: MaybeBox<number>) => x,
              tfa,
          ) as MaybeBox<ListBox<number>>
          caseMaybe(t, seq, (lst1: ListBox<number>) =>
              caseMaybe(t, trav, (lst2: ListBox<number>) => t.same(toArray(lst1), toArray(lst2))),
          )
    })
})
