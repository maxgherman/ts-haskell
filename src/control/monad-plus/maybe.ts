import { monadPlus as createMonadPlus, MonadPlus } from './monad-plus'
import { monad } from 'ghc/base/maybe/monad'
import { alternative } from 'ghc/base/maybe/alternative'
import { MaybeBox } from 'ghc/base/maybe/maybe'
import type { List } from 'ghc/base/list/list'
import type { MaybeMonad } from 'ghc/base/maybe/monad'
import type { MaybeAlternative } from 'ghc/base/maybe/alternative'

export type MaybeMonadPlus = MaybeMonad &
    MaybeAlternative & {
        mzero<A>(): MaybeBox<A>
        mplus<A>(a: MaybeBox<A>, b: MaybeBox<A>): MaybeBox<A>
        msum<A>(ms: List<MaybeBox<A>>): MaybeBox<A>
    }

const base = {
    mzero: alternative.empty,
    mplus: alternative['<|>'],
}

export const monadPlus = (() => {
    const mp = createMonadPlus(base, monad, alternative) as MaybeMonadPlus
    return mp
})()
