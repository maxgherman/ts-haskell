import tap from 'tap'
import { apply } from 'ghc/base/list/apply'
import { cons, nil, head, ListBox } from 'ghc/base/list/list'

tap.test('List Apply', async (t) => {
    const A = apply

    const fa = cons<number>(2)(nil<number>())
    const fb = cons<number>(3)(nil<number>())

    const rApply = A['<*>'](cons<(x: number) => number>((x) => x + 1)(nil()), fa) as ListBox<number>
    t.equal(head(rApply), 3)

    const rThen = A['*>'](fa, fb) as ListBox<number>
    t.equal(head(rThen), 3)

    const rLeft = A['<*'](fa, fb) as ListBox<number>
    t.equal(head(rLeft), 2)

    const rFlip = A['<**>'](fa, cons<(x: number) => number>((x) => x * 10)(nil())) as ListBox<number>
    t.equal(head(rFlip), 20)
})
