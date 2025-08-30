import tap from 'tap'
import { foldable } from 'data/either/foldable'
import { left, right } from 'data/either/either'
import { toArray } from 'ghc/base/list/list'

tap.test('Either foldable', (t) => {
    const fb = foldable<string>()
    const eRight = right<string, number>(2)
    const eLeft = left<string, number>('err')

    t.equal(
        fb.foldr((x: number, acc: number) => x + acc, 0, eRight),
        2,
    )
    t.equal(
        fb.foldr((x: number, acc: number) => x + acc, 0, eLeft),
        0,
    )

    t.same(toArray(fb.toList(eRight)), [2])
    t.same(toArray(fb.toList(eLeft)), [])

    t.equal(fb.length(eRight), 1)
    t.equal(fb.length(eLeft), 0)

    t.notOk(fb.null(eRight))
    t.ok(fb.null(eLeft))

    t.ok(fb.elem(2, eRight))
    t.notOk(fb.elem(2, eLeft))

    t.end()
})
