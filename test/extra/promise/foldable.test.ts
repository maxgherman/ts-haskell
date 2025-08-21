import tap from 'tap'
import { foldable } from 'extra/promise/foldable'
import { toArray } from 'ghc/base/list/list'
import type { PromiseBox } from 'extra/promise/promise'

const promise = Promise.resolve(5) as PromiseBox<number>

tap.test('Promise foldable', (t) => {
    t.equal(foldable.foldr((x: number, acc: number) => x + acc, 0, promise), 0)
    t.equal(foldable.foldl((acc: number, x: number) => acc + x, 0, promise), 0)
    t.same(toArray(foldable.toList(promise)), [])
    t.ok(foldable.null(promise))
    t.equal(foldable.length(promise), 0)
    t.end()
})
