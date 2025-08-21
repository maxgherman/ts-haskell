import tap from 'tap'
import { foldable } from 'ghc/base/tuple/foldable'
import { tuple2 } from 'ghc/base/tuple/tuple'
import { toArray } from 'ghc/base/list/list'

tap.test('Tuple2 foldable', (t) => {
    const tup = tuple2('x', 3)
    const fb = foldable<string>()

    t.equal(fb.foldr((x: number, acc: number) => x + acc, 0, tup), 3)
    t.equal(fb.foldl((acc: number, x: number) => acc + x, 0, tup), 3)
    t.same(toArray(fb.toList(tup)), [3])
    t.equal(fb.length(tup), 1)
    t.notOk(fb.null(tup))
    t.ok(fb.elem(3, tup))
    t.end()
})
