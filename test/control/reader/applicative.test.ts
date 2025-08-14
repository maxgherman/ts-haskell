import tap from 'tap'
import { id, dot, Dot } from 'ghc/base/functions'
import { applicative as createApplicative } from 'control/reader/applicative'
import { reader, ReaderBox } from 'control/reader/reader'
import { $case as maybeCase, just, nothing, MaybeBox } from 'ghc/base/maybe/maybe'
import { applicative as maybeApplicative } from 'ghc/base/maybe/applicative'
import {
    $case as eitherCase,
    left,
    right,
    EitherBox,
} from 'data/either/either'
import { applicative as eitherApplicative } from 'data/either/applicative'
import { tuple2, snd, Tuple2Box, UnitBox, unit } from 'ghc/base/tuple/tuple'
import { applicative as tupleApplicative } from 'ghc/base/tuple/tuple2-applicative'
import { monoid as unitMonoid } from 'ghc/base/tuple/unit-monoid'
import { applicative as promiseApplicative } from 'extra/promise/applicaive'
import { PromiseBox } from 'extra/promise/promise'

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

    t.test('Applicative with Maybe', async (t) => {
        const r1 = reader((env: string) =>
            env.length > 0 ? just(env.length) : nothing<number>(),
        )
        const r2 = reader((env: string) =>
            env.includes('!') ? just(env.length) : nothing<number>(),
        )

        const result = applicative.liftA2(
            (m1: MaybeBox<number>) =>
            (m2: MaybeBox<number>) =>
                maybeApplicative.liftA2(
                    (x: number) => (y: number) => x + y,
                    m1,
                    m2,
                ),
            r1,
            r2,
        )

        const runMaybe = (env: string) =>
            maybeCase<number, number | undefined>({
                just: (x) => x,
                nothing: () => undefined,
            })(result.runReader(env) as MaybeBox<number>)

        t.equal(runMaybe('abc!'), 8)
        t.equal(runMaybe('abc'), undefined)
    })

    t.test('Applicative with Either', async (t) => {
        const r1 = reader((env: string) =>
            env.length > 0
                ? right<string, number>(env.length)
                : left<string, number>('empty'),
        )
        const r2 = reader((env: string) =>
            env.includes('!')
                ? right<string, number>(env.length)
                : left<string, number>('no bang'),
        )

        const eitherApp = eitherApplicative<string>()
        const result = applicative.liftA2(
            (e1: EitherBox<string, number>) =>
            (e2: EitherBox<string, number>) =>
                eitherApp.liftA2(
                    (x: number) => (y: number) => x + y,
                    e1,
                    e2,
                ),
            r1,
            r2,
        )

        const runEither = (env: string) =>
            eitherCase<string, number, string | number>({
                left: (l) => l,
                right: (r) => r,
            })(result.runReader(env) as EitherBox<string, number>)

        t.equal(runEither('abc!'), 8)
        t.equal(runEither(''), 'empty')
        t.equal(runEither('abc'), 'no bang')
    })

    t.test('Applicative with Tuple', async (t) => {
        const tupleApp = tupleApplicative(unitMonoid)

        const r1 = reader((env: string) => tuple2(unit(), env.length))
        const r2 = reader((env: string) => tuple2(unit(), env.length * 2))

        const result = applicative.liftA2(
            (t1: Tuple2Box<UnitBox, number>) =>
            (t2: Tuple2Box<UnitBox, number>) =>
                tupleApp.liftA2(
                    (x: number) => (y: number) => x + y,
                    t1,
                    t2,
                ),
            r1,
            r2,
        )

        const tuple = result.runReader('abc') as Tuple2Box<UnitBox, number>
        t.equal(snd(tuple), 9)
    })

    t.test('Applicative with Promise', async (t) => {
        const r1 = reader((env: string) => Promise.resolve(env.length) as PromiseBox<number>)
        const r2 = reader((env: string) => Promise.resolve(env.length * 2) as PromiseBox<number>)

        const result = applicative.liftA2(
            (p1: PromiseBox<number>) =>
            (p2: PromiseBox<number>) =>
                promiseApplicative.liftA2(
                    (x: number) => (y: number) => x + y,
                    p1,
                    p2,
                ),
            r1,
            r2,
        )

        t.equal(await (result.runReader('abc') as PromiseBox<number>), 9)
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

