import tap from 'tap'
import { compose } from 'ghc/base/functions'

tap.test('compose', async (t) => {
    t.test('compose seven functions', async (t) => {
        const f0 = (x: number) => x + 1
        const f1 = (x: number) => x * 2
        const f2 = (x: number) => x - 3
        const f3 = (x: number) => x * x
        const f4 = (x: number) => x - 10
        const f5 = (x: number) => x / 2
        const f6 = (x: number) => x.toString()

        const result = compose(f6, f5, f4, f3, f2, f1, f0)(3)
        t.equal(result, '7.5')
    })
})
