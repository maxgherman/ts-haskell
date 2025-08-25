import { MinBox1 } from 'data/kind'
import { List, head, tail, $null } from 'ghc/base/list/list'
import { Monad } from 'ghc/base/monad/monad'
import { Alternative } from 'control/alternative/alternative'

export type MonadPlusBase = {
    mzero<A>(): MinBox1<A>
    mplus<A>(ma: MinBox1<A>, mb: MinBox1<A>): MinBox1<A>
}

export type MonadPlus = Monad &
    Alternative &
    MonadPlusBase & {
        msum<A>(ms: List<MinBox1<A>>): MinBox1<A>
    }

export type BaseImplementation = Pick<MonadPlusBase, 'mzero' | 'mplus'>

export const monadPlus = (base: BaseImplementation, monad: Monad, alternative: Alternative): MonadPlus => {
    const msum = <A>(ms: List<MinBox1<A>>): MinBox1<A> => {
        if ($null(ms)) {
            return base.mzero<A>()
        }

        return base.mplus(head(ms), msum(tail(ms)))
    }

    return {
        ...monad,
        ...alternative,
        ...base,
        msum,
    }
}

export const guard =
    (m: MonadPlus) =>
    (b: boolean): MinBox1<[]> =>
        b ? m.return<[]>([]) : m.mzero<[]>()
