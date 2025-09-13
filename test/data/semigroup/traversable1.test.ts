import tap from 'tap'
import {
    traversable1 as createTraversable1,
    Traversable1,
    BaseImplementation,
    kindOf,
} from 'data/semigroup/traversable'
import { Foldable1 } from 'data/semigroup/foldable'
import { functor as listFunctor } from 'ghc/base/list/functor'
import { apply as listApply } from 'ghc/base/list/apply'
import { cons, nil, toArray, ListBox } from 'ghc/base/list/list'

tap.test('Traversable1 kindOf', async (t) => {
    const k = kindOf({} as Traversable1) as (_: (_: '*') => '*') => 'Constraint'
    t.equal(
        k((_: '*') => '*'),
        'Constraint',
    )
})

tap.test('Traversable1 derives sequence1 from traverse1', async (t) => {
    const base: BaseImplementation = {
        traverse1: <A, B>(_: unknown, f: (a: A) => ListBox<B>, ta: ListBox<A>): ListBox<ListBox<B>> =>
            listFunctor.fmap(f, ta) as ListBox<ListBox<B>>,
    }

    const traverse = createTraversable1(base, listFunctor, {} as unknown as Foldable1) as Traversable1

    const list = cons<ListBox<number>>(cons<number>(1)(nil<number>()))(
        cons<ListBox<number>>(cons<number>(2)(nil<number>()))(nil<ListBox<number>>()),
    )

    const result = traverse.sequence1<number>(listApply, list) as ListBox<ListBox<number>>
    // Our traverse1 ignores effects and just maps, so sequence1 should be identity (same nesting)
    t.same(toArray(result).map(toArray), [[1], [2]])
})
