import tap from 'tap'
import { monad as maybeMonad } from 'ghc/base/maybe/monad'
import { Type } from 'data/kind'
import {
    readerT as readerTTrans,
    writerT as writerTTrans,
    stateT as stateTTrans,
} from 'control/monad/trans/monad-trans'
import { monoid as listMonoid } from 'ghc/base/list/monoid'

const M = maybeMonad

tap.test('MonadTrans kind function', async (t) => {
    // argument with the transformer kind: (* -> *) -> * -> *
    const kArg: (_: (_: Type) => Type) => (_: Type) => Type = (_: (_: Type) => Type) => (_: Type) => '*' as Type

    const R = readerTTrans<number>(M)
    t.equal(R.kind(kArg), 'Constraint')

    const W = listMonoid<string>()
    const Wt = writerTTrans(M, W)
    t.equal(Wt.kind(kArg), 'Constraint')

    const St = stateTTrans<number>(M)
    t.equal(St.kind(kArg), 'Constraint')
})
