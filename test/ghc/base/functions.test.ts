import tap from 'tap'
import { compose } from 'ghc/base/functions'

tap.test('functions', async (t) => {
    t.test('composition of unary functions', async (t) => {
        const add1 = (x: number) => x + 1
        const square = (x: number) => x * x

        const result = compose(square, add1)(2)

        t.equal(result, 9)
    })

    t.test('variadic first function', async (t) => {
        const sum = (...xs: number[]) => xs.reduce((acc, x) => acc + x, 0)
        const double = (x: number) => x * 2

        const result = compose(double, sum)(1, 2, 3)

        t.equal(result, 12)
    })

    t.test('composition of seven functions', async (t) => {
        const f0 = (x: number) => x + 1
        const f1 = (x: number) => x * 2
        const f2 = (x: number) => x - 3
        const f3 = (x: number) => x * 4
        const f4 = (x: number) => x - 5
        const f5 = (x: number) => x * 6
        const f6 = (x: number) => `Value is ${x}`

        const result = compose(f6, f5, f4, f3, f2, f1, f0)(1)

        t.equal(result, 'Value is -6')
    })
})
