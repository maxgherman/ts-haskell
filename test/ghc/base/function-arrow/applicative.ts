import tap from 'tap'
import { id, dot, Dot } from 'ghc/base/functions'
import { applicative as createApplicative } from 'ghc/base/function-arrow/applicative'
import { FunctionArrow, FunctionArrowBox, withKind } from 'ghc/prim/function-arrow'

const applicative = createApplicative<number>()

tap.test('FunctionArrow applicative', async (t) => {
    t.test('pure', async (t) => {
        const result = applicative.pure('Test')

        t.equal(result(1), 'Test')
    })

    t.test('<*>', async (t) => {
        const app: FunctionArrow<number, string> = (x: number) => `${x} * 2`
        const applicationList = withKind((x: number) => withKind((y: number) => app(x + y)))
        const value = withKind((x: number) => x * 2)

        const result = applicative['<*>'](applicationList, value)

        t.equal(result(5), '15 * 2')
    })

    t.test('liftA2', async (t) => {
        const app =
            (x: string) =>
            (y: string): string =>
                `(${x},${y})`

        const app1 = withKind((x: number) => `${x} * 2`)
        const app2 = withKind((x: number) => `${x} + 3`)
        const result = applicative.liftA2(app, app1, app2)

        t.equal(result(5), `(5 * 2,5 + 3)`)
    })

    t.test('*>', async (t) => {
        const app1 = withKind((x: number) => `${x} * 2`)
        const app2 = withKind((x: number) => `${x} + 3`)

        const result = applicative['*>'](app1, app2)

        t.equal(result(10), `10 + 3`)
    })

    t.test('<*', async (t) => {
        const app1 = withKind((x: number) => `${x} * 2`)
        const app2 = withKind((x: number) => `${x} + 3`)

        const result = applicative['<*'](app1, app2)

        t.equal(result(10), `10 * 2`)
    })

    t.test('<**>', async (t) => {
        const app: FunctionArrow<number, string> = (x: number) => `${x} * 2`
        const applicationList = withKind((x: number) => withKind((y: number) => app(x + y)))
        const value = withKind((x: number) => x * 2)

        const result = applicative['<**>'](value, applicationList)

        t.equal(result(5), '15 * 2')
    })

    t.test('fmap', async (t) => {
        const app = (x: number) => x * 2
        const value = withKind((x: number) => x + 3)

        const result = applicative.fmap(app, value)

        t.same(result(10), 26)
    })

    t.test('Applicative first law (Identity): pure id <*> v = v', async (t) => {
        const v = withKind((x: number) => x + 2)
        const pureId = applicative.pure<FunctionArrow<number, number>>(id)
        const result = applicative['<*>'](pureId, v)

        t.equal(result(10), v(10))
        t.equal(result(10), 12)
    })

    t.test('Applicative second law (Homomorphism): pure f <*> pure x = pure (f x)', async (t) => {
        const x = 123
        const f = (x: number) => x + 1
        const left = applicative['<*>'](applicative.pure(f), applicative.pure(x))
        const right = applicative.pure(f(x))

        t.same(left(10), right(10))
        t.same(right(10), 124)
    })

    // ($) :: (a -> b) -> a -> b
    t.test('Applicative third law (Interchange): u <*> pure y = pure ($ y) <*> u', async (t) => {
        const app = (x: number) => x * 2
        const u = withKind((x: number) => withKind((y: number) => app(x + y)))
        const y = 123
        const $y = (f: FunctionArrow<number, number>) => f(y)

        const left = applicative['<*>'](u, applicative.pure(y))
        const right = applicative['<*>'](applicative.pure($y), u)

        t.same(left(10), right(10))
        t.same(right(10), 266)
    })

    t.test('Applicative forth law (Composition): pure (.) <*> u <*> v <*> w = u <*> (v <*> w)', async (t) => {
        const pureDot = applicative.pure(dot) as FunctionArrowBox<number, Dot<number, string, string>>

        const v = withKind((x: number) => withKind((y: number) => `${x} * ${y}`))
        const u = withKind((x: number) => withKind((y: string) => `${x} + ${y}`))
        const w = withKind((x: number) => x * 2)

        const right = applicative['<*>'](u, applicative['<*>'](v, w))
        const left = applicative['<*>'](applicative['<*>'](applicative['<*>'](pureDot, u), v), w)

        t.same(left(10), right(10))
        t.same(right(10), '10 + 10 * 20')
    })
})
