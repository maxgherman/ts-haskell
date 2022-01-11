import tap from 'tap'
import { compose, id, dot, Dot } from 'ghc/base/functions'
import { applicative as createApplicative } from 'data/either/applicative'
import { left, right, $case, EitherBox } from 'data/either/either'
import type { FunctionArrow } from 'ghc/prim/function-arrow'

const applicative = createApplicative<Error>()

const getValue = (value: EitherBox<Error, unknown>): unknown | Error =>
    $case<Error, unknown, unknown | Error>({
        left: id,
        right: id,
    })(value)

tap.test('Either applicative', async (t) => {
    t.test('pure', async (t) => {
        const result = applicative.pure(3)

        t.same(getValue(result), 3)
    })

    t.test('<*>', async (t) => {
        const app: FunctionArrow<number, number> = (x: number) => x * 2
        const application = right<Error, FunctionArrow<number, number>>(app)
        const value = right<Error, number>(3)
        const applicationError = left<Error, FunctionArrow<number, number>>(new Error('Test app'))
        const valueError = left<Error, number>(new Error('Test value'))

        const result1 = applicative['<*>'](application, value)
        const result2 = applicative['<*>'](applicationError, value)
        const result3 = applicative['<*>'](application, valueError)
        const result4 = applicative['<*>'](applicationError, valueError)

        t.equal(getValue(result1), 6)
        t.equal((getValue(result2) as Error).message, 'Test app')
        t.equal((getValue(result3) as Error).message, 'Test value')
        t.equal((getValue(result4) as Error).message, 'Test app')
    })

    t.test('liftA2', async (t) => {
        const app =
            (x: number) =>
            (y: number): string =>
                `(${x},${y})`

        const value1 = right<Error, number>(2)
        const value2 = right<Error, number>(3)
        const valueError = left<Error, number>(new Error('Error'))

        const result1 = applicative.liftA2(app, value1, value2)
        const result2 = applicative.liftA2(app, valueError, value2)
        const result3 = applicative.liftA2(app, value1, valueError)
        const result4 = applicative.liftA2(app, valueError, valueError)

        t.equal(getValue(result1), '(2,3)')
        t.equal((getValue(result2) as Error).message, 'Error')
        t.equal((getValue(result3) as Error).message, 'Error')
        t.equal((getValue(result4) as Error).message, 'Error')
    })

    t.test('*>', async (t) => {
        const value1 = right<Error, number>(2)
        const value2 = right<Error, number>(3)
        const valueError = left<Error, number>(new Error('Test error'))

        const result1 = applicative['*>'](value1, value2)
        const result2 = applicative['*>'](valueError, value2)
        const result3 = applicative['*>'](value1, valueError)
        const result4 = applicative['*>'](valueError, valueError)

        t.equal(getValue(result1), 3)
        t.equal((getValue(result2) as Error).message, 'Test error')
        t.equal((getValue(result3) as Error).message, 'Test error')
        t.equal((getValue(result4) as Error).message, 'Test error')
    })

    t.test('<*', async (t) => {
        const value1 = right<Error, number>(2)
        const value2 = right<Error, number>(3)
        const valueError = left<Error, number>(new Error('Test error'))

        const result1 = applicative['<*'](value1, value2)
        const result2 = applicative['<*'](valueError, value2)
        const result3 = applicative['<*'](value1, valueError)
        const result4 = applicative['<*'](valueError, valueError)

        t.equal(getValue(result1), 2)
        t.equal((getValue(result2) as Error).message, 'Test error')
        t.equal((getValue(result3) as Error).message, 'Test error')
        t.equal((getValue(result4) as Error).message, 'Test error')
    })

    t.test('<**>', async (t) => {
        const app: FunctionArrow<number, number> = (x: number) => x * 2
        const application = right<Error, FunctionArrow<number, number>>(app)
        const applicationError = left<Error, FunctionArrow<number, number>>(new Error('Test app'))
        const value = right<Error, number>(3)
        const valueError = left<Error, number>(new Error('Test value'))

        const result1 = applicative['<**>'](value, application)
        const result2 = applicative['<**>'](valueError, application)
        const result3 = applicative['<**>'](value, applicationError)
        const result4 = applicative['<**>'](valueError, applicationError)

        t.equal(getValue(result1), 6)
        t.equal((getValue(result2) as Error).message, 'Test value')
        t.equal((getValue(result3) as Error).message, 'Test app')
        t.equal((getValue(result4) as Error).message, 'Test value')
    })

    t.test('fmap', async (t) => {
        const app: FunctionArrow<number, number> = (x: number) => x * 2
        const value = right<Error, number>(3)
        const valueError = left<Error, number>(new Error('Test value'))

        const result1 = applicative.fmap(app, value)
        const result2 = applicative.fmap(app, valueError)

        t.equal(getValue(result1), 6)
        t.equal((getValue(result2) as Error).message, 'Test value')
    })

    t.test('Applicative first law (Identity): pure id <*> v = v', async (t) => {
        t.test('nothing', async (t) => {
            const v = left<Error, number>(new Error('Test v'))
            const pureId = applicative.pure<FunctionArrow<number, number>>(id)
            const result = applicative['<*>'](pureId, v)

            t.equal(getValue(result), getValue(v))
            t.equal((getValue(result) as Error).message, 'Test v')
        })

        t.test('right', async (t) => {
            const v = right<Error, number>(123)
            const pureId = applicative.pure<FunctionArrow<number, number>>(id)
            const result = applicative['<*>'](pureId, v)

            t.equal(getValue(result), getValue(v))
            t.equal(getValue(result), 123)
        })
    })

    t.test('Applicative second law (Homomorphism): pure f <*> pure x = pure (f x)', async (t) => {
        const x = 123
        const f = (x: number) => x + 1
        const left = applicative['<*>'](applicative.pure(f), applicative.pure(x))
        const right = applicative.pure(f(x))

        t.same(getValue(left), getValue(right))
        t.same(getValue(right), 124)
    })

    // ($) :: (a -> b) -> a -> b
    t.test('Applicative third law (Interchange): u <*> pure y = pure ($ y) <*> u', async (t) => {
        t.test('nothing', async (t) => {
            const u = left<Error, FunctionArrow<number, number>>(new Error('Test u'))
            const y = 123
            const $y = (f: FunctionArrow<number, number>) => f(y)

            const leftSide = applicative['<*>'](u, applicative.pure(y))
            const rightSide = applicative['<*>'](applicative.pure($y), u)

            t.same(getValue(leftSide), getValue(rightSide))
            t.same((getValue(rightSide) as Error).message, 'Test u')
        })

        t.test('just', async (t) => {
            const app: FunctionArrow<number, number> = (x: number) => x * 2
            const u = right<Error, FunctionArrow<number, number>>(app)
            const y = 123
            const $y = (f: FunctionArrow<number, number>) => f(y)

            const leftSide = applicative['<*>'](u, applicative.pure(y))
            const rightSide = applicative['<*>'](applicative.pure($y), u)

            t.same(getValue(leftSide), getValue(rightSide))
            t.same(getValue(rightSide), 246)
        })
    })

    t.test('Applicative forth law (Composition): pure (.) <*> u <*> v <*> w = u <*> (v <*> w)', async (t) => {
        const pureDot = applicative.pure(dot) as EitherBox<Error, Dot<number, number, number>>

        t.test('just', async (t) => {
            const app1: FunctionArrow<number, number> = (x: number) => x * 2
            const app2: FunctionArrow<number, number> = (x: number) => x - 3
            const v = right<Error, FunctionArrow<number, number>>(app1)
            const u = right<Error, FunctionArrow<number, number>>(app2)
            const w = right<Error, number>(10)

            const rightSide = applicative['<*>'](u, applicative['<*>'](v, w))
            const leftSide = applicative['<*>'](applicative['<*>'](applicative['<*>'](pureDot, u), v), w)

            t.same(getValue(leftSide), getValue(rightSide))
            t.same(getValue(rightSide), 17)
        })

        t.test('nothing', async (t) => {
            const appC =
                <A, B>(x: EitherBox<Error, FunctionArrow<A, B>>) =>
                (y: EitherBox<Error, A>) =>
                    applicative['<*>'](x, y)

            const v = left<Error, FunctionArrow<number, number>>(new Error('Test v'))
            const u = left<Error, FunctionArrow<number, number>>(new Error('Test u'))
            const w = left<Error, number>(new Error('Test w'))

            const leftSide = compose(
                (x) => appC(x)(w),
                (x: EitherBox<Error, (g: (_: number) => number) => (a: number) => number>) => appC(x)(v),
                appC(pureDot),
            )(u)
            const rightSide = compose(appC(u), appC(v))(w)

            t.same(getValue(leftSide), getValue(rightSide))
            t.same((getValue(rightSide) as Error).message, 'Test u')
        })
    })
})
