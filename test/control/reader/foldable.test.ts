import tap from 'tap'
import { foldable } from 'control/reader/foldable'
import { reader } from 'control/reader/reader'
import { toArray } from 'ghc/base/list/list'

tap.test('Reader foldable', (t) => {
    const r = reader(() => 5)

    const fb = foldable<unknown>()
    t.equal(
        fb.foldr((x: number, acc: number) => x + acc, 0, r),
        5,
    )
    t.equal(
        fb.foldl((acc: number, x: number) => acc + x, 0, r),
        5,
    )
    t.same(toArray(fb.toList(r)), [5])
    t.equal(fb.length(r), 1)
    t.notOk(fb.null(r))
    t.ok(fb.elem(5, r))
    t.end()
})
