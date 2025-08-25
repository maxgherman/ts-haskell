import { monadPlus as createMonadPlus } from './monad-plus'
import { monad } from 'ghc/base/list/monad'
import { alternative } from 'ghc/base/list/alternative'
import type { ListMonad } from 'ghc/base/list/monad'
import type { ListAlternative } from 'ghc/base/list/alternative'
import type { ListBox } from 'ghc/base/list/list'
import type { List } from 'ghc/base/list/list'

export type ListMonadPlus<T> = ListMonad &
    ListAlternative<T> & {
        mzero<A>(): ListBox<A>
        mplus<A>(a: ListBox<A>, b: ListBox<A>): ListBox<A>
        msum<A>(ms: List<ListBox<A>>): ListBox<A>
    }

export const monadPlus = <T>(): ListMonadPlus<T> => {
    const alt = alternative<T>()
    const base = {
        mzero: alt.empty,
        mplus: alt['<|>'],
    }

    return createMonadPlus(base, monad, alt) as ListMonadPlus<T>
}
