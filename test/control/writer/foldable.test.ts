import tap from 'tap'
import { foldable } from 'control/writer/foldable'
import { writer } from 'control/writer/writer'
import { tuple2 } from 'ghc/base/tuple/tuple'
import { toArray } from 'ghc/base/list/list'

tap.test('Writer foldable', (t) => {
    const w = writer(() => tuple2(5, 'log'))

    const fb = foldable<string>()
    t.equal(fb.foldr((x: number, acc: number) => x + acc, 0, w), 5)
    t.equal(fb.foldl((acc: number, x: number) => acc + x, 0, w), 5)
    t.same(toArray(fb.toList(w)), [5])
    t.equal(fb.length(w), 1)
    t.notOk(fb.null(w))
    t.ok(fb.elem(5, w))
    t.end()
})
