import tap from 'tap'
import { apply } from 'ghc/base/non-empty/apply'
import { cons as neCons, toList, NonEmptyBox } from 'ghc/base/non-empty/list'
import { nil, head } from 'ghc/base/list/list'

tap.test('NonEmpty Apply', async (t) => {
    const A = apply

    const nf = neCons<(x: number) => number>((x) => x + 1)(nil())
    const na = neCons<number>(2)(nil<number>())

    const r = A['<*>'](nf, na) as NonEmptyBox<number>
    t.equal(head(toList(r)), 3)

    const rThen = A['*>'](na, neCons<number>(5)(nil<number>())) as NonEmptyBox<number>
    t.equal(head(toList(rThen)), 5)

    const rLeft = A['<*'](na, neCons<number>(5)(nil<number>())) as NonEmptyBox<number>
    t.equal(head(toList(rLeft)), 2)

    const rFlip = A['<**>'](na, nf) as NonEmptyBox<number>
    t.equal(head(toList(rFlip)), 3)
})
