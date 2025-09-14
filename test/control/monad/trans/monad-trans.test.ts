import tap from 'tap'
import { monad as maybeMonad } from 'ghc/base/maybe/monad'
import { Type } from 'data/kind'
import {
    readerT as readerTTrans,
    writerT as writerTTrans,
    stateT as stateTTrans,
} from 'control/monad/trans/monad-trans'
import { monoid as listMonoid } from 'ghc/base/list/monoid'

const maybeM = maybeMonad

tap.test('MonadTrans kind function', async (t) => {
    // argument with the transformer kind: (* -> *) -> * -> *
    const kArg: (_: (_: Type) => Type) => (_: Type) => Type = (_: (_: Type) => Type) => (_: Type) => '*' as Type

    const readerTransformer = readerTTrans<number>(maybeM)
    t.equal(readerTransformer.kind(kArg), 'Constraint')

    const logsMonoid = listMonoid<string>()
    const writerTransformer = writerTTrans(maybeM, logsMonoid)
    t.equal(writerTransformer.kind(kArg), 'Constraint')

    const stateTransformer = stateTTrans<number>(maybeM)
    t.equal(stateTransformer.kind(kArg), 'Constraint')
})
