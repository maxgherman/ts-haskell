import tap from 'tap'
import { apply } from 'extra/promise/apply'
import { PromiseBox } from 'extra/promise/promise'

tap.test('Promise Apply', async (t) => {
    const A = apply

    const f = Promise.resolve((x: number) => x + 1) as PromiseBox<(x: number) => number>
    const a = Promise.resolve(2) as PromiseBox<number>

    const r = await A['<*>'](f, a)
    t.equal(r, 3)

    const rThen = await A['*>'](Promise.resolve(1) as PromiseBox<number>, Promise.resolve(5) as PromiseBox<number>)
    t.equal(rThen, 5)

    const rLeft = await A['<*'](Promise.resolve(1) as PromiseBox<number>, Promise.resolve(5) as PromiseBox<number>)
    t.equal(rLeft, 1)

    const rFlip = await A['<**>'](
        Promise.resolve(2) as PromiseBox<number>,
        Promise.resolve((x: number) => x + 3) as PromiseBox<(x: number) => number>,
    )
    t.equal(rFlip, 5)
})
