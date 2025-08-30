import tap from 'tap'
import { id, dot, Dot } from 'ghc/base/functions'
import { applicative } from 'extra/promise/applicative'
import { PromiseBox } from 'extra/promise/promise'
import type { FunctionArrow } from 'ghc/prim/function-arrow'

tap.test('List applicative', async (t) => {
    t.test('pure', async (t) => {
        const result = await applicative.pure(3)

        t.same(result, 3)
    })

    t.test('<*>', async (t) => {
        const app = applicative.pure((x: number) => x * 2)
        const value = applicative.pure(3)

        const result = await applicative['<*>'](app, value)

        t.equal(result, 6)
    })

    t.test('liftA2', async (t) => {
        const app =
            (x: number) =>
            (y: number): string =>
                `(${x},${y})`

        const value1 = applicative.pure(3)
        const value2 = applicative.pure(5)

        const result = await applicative.liftA2(app, value1, value2)

        t.same(result, '(3,5)')
    })

    t.test('*>', async (t) => {
        const value1 = applicative.pure(3)
        const value2 = applicative.pure(5)

        const result = await applicative['*>'](value1, value2)

        t.same(result, 5)
    })

    t.test('<*', async (t) => {
        const value1 = applicative.pure(3)
        const value2 = applicative.pure(5)

        const result = await applicative['<*'](value1, value2)

        t.same(result, 3)
    })

    t.test('<**>', async (t) => {
        const app = applicative.pure((x: number) => x * 2)
        const value = applicative.pure(10)

        const result = await applicative['<**>'](value, app)

        t.same(result, 20)
    })

    t.test('fmap', async (t) => {
        const app = (x: number) => x * 2
        const value = applicative.pure(10)

        const result = await applicative.fmap(app, value)

        t.same(result, 20)
    })

    t.test('Applicative first law (Identity): pure id <*> v = v', async (t) => {
        const v = applicative.pure(3)
        const pureId = applicative.pure<FunctionArrow<number, number>>(id)
        const result = await applicative['<*>'](pureId, v)

        t.same(result, await v)
    })

    t.test('Applicative second law (Homomorphism): pure f <*> pure x = pure (f x)', async (t) => {
        const x = 123
        const f = (x: number) => x + 1
        const left = await applicative['<*>'](applicative.pure(f), applicative.pure(x))
        const right = await applicative.pure(f(x))

        t.same(left, right)
        t.same(right, 124)
    })

    // ($) :: (a -> b) -> a -> b
    t.test('Applicative third law (Interchange): u <*> pure y = pure ($ y) <*> u', async (t) => {
        const u = applicative.pure((x: number) => x * 2)
        const y = 123
        const $y = (f: FunctionArrow<number, number>) => f(y)

        const left = await applicative['<*>'](u, applicative.pure(y))
        const right = await applicative['<*>'](applicative.pure($y), u)

        t.same(left, right)
        t.same(right, 246)
    })

    t.test('Applicative fourth law (Composition): pure (.) <*> u <*> v <*> w = u <*> (v <*> w)', async (t) => {
        const pureDot = applicative.pure(dot) as PromiseBox<Dot<number, number, number>>

        const v = applicative.pure((x: number) => x * 2)
        const u = applicative.pure((x: number) => x - 3)
        const w = applicative.pure(5)

        const right = await applicative['<*>'](u, applicative['<*>'](v, w))
        const left = await applicative['<*>'](applicative['<*>'](applicative['<*>'](pureDot, u), v), w)

        t.same(left, right)
        t.same(right, 7)
    })
})
