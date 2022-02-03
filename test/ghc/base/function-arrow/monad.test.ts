import tap from 'tap'
import { monad as createMonad } from 'ghc/base/function-arrow/monad'
import { FunctionArrowBox, withKind } from 'ghc/prim/function-arrow'
import { doNotation } from 'ghc/base/monad/do-notation'

const monad = createMonad<number>()

tap.test('FunctionArrow monad', async (t) => {
    t.test('return', async (t) => {
        const result = monad.pure(3)

        t.equal(result(1), 3)
    })

    t.test('>>=', async (t) => {
        const app = withKind((x: number) => `${x} * 2`)
        const f = withKind((x: string) => withKind((y: number) => `${x} + ${y}`))

        const result = monad['>>='](app, f)

        t.equal(result(10), '10 * 2 + 10')
    })

    t.test('>>', async (t) => {
        const app1 = withKind((x: number) => `${x} * 2`)
        const app2 = withKind((x: number) => `${x} + 2`)

        const result = monad['>>'](app1, app2)

        t.equal(result(10), '10 + 2')
    })

    t.test('Monad first law (Left identity): return a >>= h = h a', async (t) => {
        const a = 3
        const returnA = monad.return(a)
        const h = withKind((x: number) => withKind((y: number) => x * y))

        const left = monad['>>='](returnA, h)
        const right = h(a)

        t.equal(left(10), right(10))
        t.same(right(10), 30)
    })

    t.test('Monad second law (Right identity): m >>= return = m', async (t) => {
        const m = withKind((x: number) => x * x)

        const left = monad['>>='](m, monad.return)

        t.same(left(11), m(11))
        t.same(m(11), 121)
    })

    t.test('Monad thrird law (Associativity): (m >>= g) >>=	h =	m >>= ((x) -> g x >>= h)', async (t) => {
        const m = withKind((x: number) => x + 1)
        const g = (x: number) => withKind((y: number) => x + y)
        const h = (x: number) => withKind((y: number) => x - y)

        const left = monad['>>='](monad['>>='](m, g), h)
        const right = monad['>>='](m, (x: number) => monad['>>='](g(x), h))

        t.same(left(10), right(10))
        t.same(left(10), 11)
    })

    t.test('do-notation', async (t) => {
        const result = doNotation<FunctionArrowBox<number, string>>(function* (): Generator<
            FunctionArrowBox<number, string>,
            string,
            string
        > {
            const value1 = yield withKind((x: number) => `${x} + 1`)
            const value2 = yield withKind((x: number) => `${x} + 2`)
            const value3 = yield withKind((x: number) => `${x} + 3`)

            return `${value1} - ${value2} - ${value3}`
        },
        monad)

        t.equal(result(10), '10 + 1 - 10 + 2 - 10 + 3')
    })
})
