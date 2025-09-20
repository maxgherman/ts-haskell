import tap from 'tap'
import { monad as listMonad } from 'ghc/base/list/monad'
import { alternative as listAlternative } from 'ghc/base/list/alternative'
import { monadPlus as createMonadPlus, BaseImplementation, guard } from 'control/monad-plus/monad-plus'
import { cons, nil, toArray, concat, ListBox } from 'ghc/base/list/list'

const listOf = (...xs: number[]): ListBox<number> => xs.reduceRight((acc, x) => cons(x)(acc), nil<number>())

tap.test('MonadPlus builder over List', async (t) => {
    const base: BaseImplementation = {
        mzero: nil,
        mplus: concat as unknown as BaseImplementation['mplus'],
    }

    const mp = createMonadPlus(base, listMonad, listAlternative<number>())

    // msum concatenates a list of lists
    const l1 = listOf(1)
    const l2 = listOf(2)
    const l3 = listOf(3)
    const listOfLists = cons(l1)(cons(l2)(cons(l3)(nil<ListBox<number>>())))
    const msumRes = mp.msum(listOfLists) as ListBox<number>
    t.same(toArray(msumRes), [1, 2, 3])

    // guard integrates with MonadPlus
    const g = guard(mp)
    const ok = g(true) as ListBox<[]>
    const no = g(false) as ListBox<[]>
    t.same(toArray(ok), [[]])
    t.same(toArray(no), [])
})
