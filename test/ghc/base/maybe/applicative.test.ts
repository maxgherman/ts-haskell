import tap from 'tap'
import { compose, id, dot, Dot } from 'ghc/base/functions'
import { applicative } from 'ghc/base/maybe/applicative'
import { $case, just, MaybeBox, nothing } from 'ghc/base/maybe/maybe'
import type { FunctionArrow } from 'ghc/prim/function-arrow'

const getValue = <A>(box: MaybeBox<A>): A | undefined =>
    $case<A, A | undefined>({
        nothing: () => undefined,
        just: id,
    })(box)

tap.test('Maybe applicative', async (t) => {
    t.test('pure', async (t) => {
        const result = applicative.pure(3)
        const value = getValue(result)

        t.equal(value, 3)
    })

    t.test('<*>', async (t) => {
        const app: FunctionArrow<number, number> = (x: number) => x * 2
        const application = just(app)
        const nothingApplication = nothing<FunctionArrow<number, number>>()
        const value = just(3)
        const nothingValue = nothing<number>()

        const result1 = applicative['<*>'](application, value)
        const result2 = applicative['<*>'](nothingApplication, value)
        const result3 = applicative['<*>'](application, nothingValue)
        const result4 = applicative['<*>'](nothingValue, nothingValue)

        t.equal(getValue(result1), 6)
        t.equal(getValue(result2), undefined)
        t.equal(getValue(result3), undefined)
        t.equal(getValue(result4), undefined)
    })

    t.test('liftA2', async (t) => {
        const app =
            (x: number) =>
            (y: number): string =>
                `(${x},${y})`

        const value1 = just(2)
        const value2 = just(3)
        const valueNothing = nothing()

        const result1 = applicative.liftA2(app, value1, value2)
        const result2 = applicative.liftA2(app, valueNothing, value2)
        const result3 = applicative.liftA2(app, value1, valueNothing)
        const result4 = applicative.liftA2(app, valueNothing, valueNothing)

        t.equal(getValue(result1), '(2,3)')
        t.equal(getValue(result2), undefined)
        t.equal(getValue(result3), undefined)
        t.equal(getValue(result4), undefined)
    })

    t.test('*>', async (t) => {
        const value1 = just(2)
        const value2 = just(3)
        const valueNothing = nothing()

        const result1 = applicative['*>'](value1, value2)
        const result2 = applicative['*>'](valueNothing, value2)
        const result3 = applicative['*>'](value1, valueNothing)
        const result4 = applicative['*>'](valueNothing, valueNothing)

        t.equal(getValue(result1), 3)
        t.equal(getValue(result2), undefined)
        t.equal(getValue(result3), undefined)
        t.equal(getValue(result4), undefined)
    })

    t.test('<*', async (t) => {
        const value1 = just(2)
        const value2 = just(3)
        const valueNothing = nothing()

        const result1 = applicative['<*'](value1, value2)
        const result2 = applicative['<*'](valueNothing, value2)
        const result3 = applicative['<*'](value1, valueNothing)
        const result4 = applicative['<*'](valueNothing, valueNothing)

        t.equal(getValue(result1), 2)
        t.equal(getValue(result2), undefined)
        t.equal(getValue(result3), undefined)
        t.equal(getValue(result4), undefined)
    })

    t.test('<**>', async (t) => {
        const app: FunctionArrow<number, number> = (x: number) => x * 2
        const application = just(app)
        const nothingApplication = nothing<FunctionArrow<number, number>>()
        const value = just(3)
        const nothingValue = nothing<number>()

        const result1 = applicative['<**>'](value, application)
        const result2 = applicative['<**>'](nothingValue, application)
        const result3 = applicative['<**>'](value, nothingApplication)
        const result4 = applicative['<**>'](nothingValue, nothingApplication)

        t.equal(getValue(result1), 6)
        t.equal(getValue(result2), undefined)
        t.equal(getValue(result3), undefined)
        t.equal(getValue(result4), undefined)
    })

    t.test('fmap', async (t) => {
        const app: FunctionArrow<number, number> = (x: number) => x * 2
        const value = just(3)
        const nothingValue = nothing<number>()

        const result1 = applicative.fmap(app, value)
        const result2 = applicative.fmap(app, nothingValue)

        t.equal(getValue(result1), 6)
        t.equal(getValue(result2), undefined)
    })

    t.test('Applicative first law (Identity): pure id <*> v = v', async (t) => {
        t.test('nothing', async (t) => {
            const v = nothing<number>()
            const pureId = applicative.pure<FunctionArrow<number, number>>(id)
            const result = applicative['<*>'](pureId, v)

            t.equal(getValue(result), getValue(v))
            t.equal(getValue(result), undefined)
        })

        t.test('just', async (t) => {
            const v = just(123)
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
            const u = nothing<FunctionArrow<number, number>>()
            const y = 123
            const $y = (f: FunctionArrow<number, number>) => f(y)

            const left = applicative['<*>'](u, applicative.pure(y))
            const right = applicative['<*>'](applicative.pure($y), u)

            t.same(getValue(left), getValue(right))
            t.same(getValue(right), undefined)
        })

        t.test('just', async (t) => {
            const app: FunctionArrow<number, number> = (x: number) => x * 2
            const u = just(app)
            const y = 123
            const $y = (f: FunctionArrow<number, number>) => f(y)

            const left = applicative['<*>'](u, applicative.pure(y))
            const right = applicative['<*>'](applicative.pure($y), u)

            t.same(getValue(left), getValue(right))
            t.same(getValue(right), 246)
        })
    })

    t.test('Applicative forth law (Composition): pure (.) <*> u <*> v <*> w = u <*> (v <*> w)', async (t) => {
        const pureDot = applicative.pure(dot) as MaybeBox<Dot<number, number, number>>

        t.test('just', async (t) => {
            const app1: FunctionArrow<number, number> = (x: number) => x * 2
            const app2: FunctionArrow<number, number> = (x: number) => x - 3
            const v = just(app1)
            const u = just(app2)
            const w = just(10)

            const right = applicative['<*>'](u, applicative['<*>'](v, w))
            const left = applicative['<*>'](applicative['<*>'](applicative['<*>'](pureDot, u), v), w)

            t.same(getValue(left), getValue(right))
            t.same(getValue(right), 17)
        })

        t.test('nothing', async (t) => {
            const appC =
                <A, B>(x: MaybeBox<FunctionArrow<A, B>>) =>
                (y: MaybeBox<A>) =>
                    applicative['<*>'](x, y)

            const v = nothing<FunctionArrow<number, number>>()
            const u = nothing<FunctionArrow<number, number>>()
            const w = nothing<number>()

            const left = compose(
                (x) => appC(x)(w),
                (x: MaybeBox<(g: (_: number) => number) => (a: number) => number>) => appC(x)(v),
                appC(pureDot),
            )(u)
            const right = compose(appC(u), appC(v))(w)

            t.same(getValue(left), getValue(right))
            t.same(getValue(right), undefined)
        })
    })
})
