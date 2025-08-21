import tap from 'tap'
import { foldable } from 'ghc/base/maybe/foldable'
import { just, nothing } from 'ghc/base/maybe/maybe'
import { toArray } from 'ghc/base/list/list'

tap.test('Maybe foldable', (t) => {
    const j = just(5)
    const n = nothing<number>()

    t.equal(foldable.foldr((a: number, b: number) => a + b, 0, j), 5)
    t.equal(foldable.foldr((a: number, b: number) => a + b, 0, n), 0)

    t.same(toArray(foldable.toList(j)), [5])
    t.same(toArray(foldable.toList(n)), [])

    t.equal(foldable.length(j), 1)
    t.equal(foldable.length(n), 0)

    t.notOk(foldable.null(j))
    t.ok(foldable.null(n))

    t.ok(foldable.elem(5, j))
    t.notOk(foldable.elem(5, n))

    t.end()
})
