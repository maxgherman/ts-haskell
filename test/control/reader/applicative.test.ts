import tap from 'tap'
import { id, dot, Dot } from 'ghc/base/functions'
import { applicative as createApplicative } from 'control/reader/applicative'
import { reader, ReaderBox } from 'control/reader/reader'

const applicative = createApplicative<string>()

const run = <A>(r: ReaderBox<string, A>, env: string) => r.runReader(env)

tap.test('Reader applicative', async (t) => {
    t.test('pure', async (t) => {
        const result = applicative.pure(3)

        t.equal(run(result, 'env'), 3)
    })

    t.test('<*>', async (t) => {
        const app = reader((env: string) => (x: number) => x + env.length)
        const value = reader((env: string) => env.length)

        const result = applicative['<*>'](app, value)

        t.equal(run(result, 'abcd'), 8)
    })

    t.test('liftA2', async (t) => {
        const app = (x: number) => (y: number): number => x + y
        const r1 = reader((env: string) => env.length)
        const r2 = reader((env: string) => env.length * 2)

        const result = applicative.liftA2(app, r1, r2)

        t.equal(run(result, 'abc'), 9)
    })

    t.test('*>', async (t) => {
        const r1 = reader((env: string) => env.length)
        const r2 = reader((env: string) => env.toUpperCase())

        const result = applicative['*>'](r1, r2)

        t.equal(run(result, 'abc'), 'ABC')
    })

    t.test('<*', async (t) => {
        const r1 = reader((env: string) => env.length)
        const r2 = reader((env: string) => env.toUpperCase())

        const result = applicative['<*'](r1, r2)

        t.equal(run(result, 'abc'), 3)
    })

    t.test('<**>', async (t) => {
        const app = reader((env: string) => (x: number) => x + env.length)
        const value = reader((env: string) => env.length)

        const result = applicative['<**>'](value, app)

        t.equal(run(result, 'abcd'), 8)
    })

    t.test('fmap', async (t) => {
        const value = reader((env: string) => env.length)

        const result = applicative.fmap((x: number) => x * 2, value)

        t.equal(run(result, 'abc'), 6)
    })

    t.test('Applicative first law (Identity): pure id <*> v = v', async (t) => {
        const v = reader((env: string) => env.length)
        const pureId = applicative.pure(id)
        const result = applicative['<*>'](pureId, v)

        const envs = ['abc', 'abcd']
        envs.forEach((env) => {
            t.equal(run(result, env), run(v, env))
        })
    })

    t.test('Applicative second law (Homomorphism): pure f <*> pure x = pure (f x)', async (t) => {
        const x = 123
        const f = (x: number) => x + 1
        const left = applicative['<*>'](applicative.pure(f), applicative.pure(x))
        const right = applicative.pure(f(x))

        t.equal(run(left, 'env'), run(right, 'env'))
        t.equal(run(right, 'env'), 124)
    })

    t.test('Applicative third law (Interchange): u <*> pure y = pure ($ y) <*> u', async (t) => {
        const u = reader((env: string) => (n: number) => n + env.length)
        const y = 5
        const $y = (f: (_: number) => number) => f(y)

        const left = applicative['<*>'](u, applicative.pure(y))
        const right = applicative['<*>'](applicative.pure($y), u)

        t.equal(run(left, 'abc'), run(right, 'abc'))
        t.equal(run(right, 'abc'), 8)
    })

    t.test('Applicative forth law (Composition): pure (.) <*> u <*> v <*> w = u <*> (v <*> w)', async (t) => {
        const pureDot = applicative.pure(dot) as ReaderBox<string, Dot<number, number, number>>

        const v = reader((env: string) => (y: number) => y + env.length)
        const u = reader((env: string) => (y: number) => y * 2)
        const w = reader((env: string) => env.length)

        const right = applicative['<*>'](u, applicative['<*>'](v, w))
        const left = applicative['<*>'](applicative['<*>'](applicative['<*>'](pureDot, u), v), w)

        t.equal(run(left, 'abc'), run(right, 'abc'))
        t.equal(run(right, 'abc'), 12)
    })
})

