import tap from 'tap'
import { compose, id } from 'ghc/base/functions'
import { functor as createFunctor } from 'control/reader/functor'
import { reader, ReaderBox } from 'control/reader/reader'
import { $case as maybeCase, just, nothing, MaybeBox } from 'ghc/base/maybe/maybe'
import { $case as eitherCase, left, right, EitherBox } from 'data/either/either'
import { fst, snd, tuple2, Tuple2Box } from 'ghc/base/tuple/tuple'
import { PromiseBox } from 'extra/promise/promise'
import { functor as promiseFunctor } from 'extra/promise/functor'

const functor = createFunctor<string>()
const lengthReader = reader((env: string) => env.length)

// For using in laws tests maybe

const fmapId = (fa: ReaderBox<string, number>) => functor.fmap(id, fa)

// Compose functions for law 2: need to compose with compose from functions

// But we define after in tests.

tap.test('ReaderFunctor functor', async (t) => {
    t.test('fmap', async (t) => {
        const result = functor.fmap((x: number) => x + 1, lengthReader)
        t.equal(result.runReader('abc'), 4)
    })

    t.test('<$>', async (t) => {
        const result = functor['<$>']((x: number) => x * 2, lengthReader)
        t.equal(result.runReader('abcd'), 8)
    })

    t.test('<$', async (t) => {
        const result = functor['<$'](5, lengthReader)
        t.equal(result.runReader('hello'), 5)
    })

    t.test('$>', async (t) => {
        const result = functor['$>'](lengthReader, 7)
        t.equal(result.runReader('world'), 7)
    })

    t.test('<&>', async (t) => {
        const result = functor['<&>'](lengthReader, (x: number) => x + 2)
        t.equal(result.runReader('abcd'), 6)
    })

    t.test('void', async (t) => {
        const result = functor.void(lengthReader)
        t.same(result.runReader('anything'), [])
    })

    t.test('Functor with Maybe', async (t) => {
        const maybeReader = reader((env: string) => (env.length > 0 ? just(env.length) : nothing<number>()))

        const result = functor.fmap(
            (m: MaybeBox<number>) =>
                maybeCase<number, MaybeBox<number>>({
                    just: (x) => just(x + 1),
                    nothing: () => nothing<number>(),
                })(m),
            maybeReader,
        )

        const run = (env: string) =>
            maybeCase<number, number | undefined>({
                just: (x) => x,
                nothing: () => undefined,
            })(result.runReader(env) as MaybeBox<number>)

        t.equal(run('abcd'), 5)
        t.equal(run(''), undefined)
    })

    t.test('Functor with Either', async (t) => {
        const eitherReader = reader((env: string) =>
            env.length > 0 ? right<string, number>(env.length) : left<string, number>('empty'),
        )

        const result = functor.fmap(
            (e: EitherBox<string, number>) =>
                eitherCase<string, number, EitherBox<string, number>>({
                    left: (l) => left<string, number>(l + '!'),
                    right: (r) => right<string, number>(r + 1),
                })(e),
            eitherReader,
        )

        const run = (env: string) =>
            eitherCase<string, number, string | number>({
                left: (l) => l,
                right: (r) => r,
            })(result.runReader(env) as EitherBox<string, number>)

        t.equal(run('abc'), 4)
        t.equal(run(''), 'empty!')
    })

    t.test('Functor with Tuple', async (t) => {
        const tupleReader = reader((env: string) => tuple2(env.length, env))

        const result = functor.fmap(
            (p: Tuple2Box<number, string>) => tuple2(fst(p) + 1, snd(p).toUpperCase()),
            tupleReader,
        )

        const tuple = result.runReader('abc') as Tuple2Box<number, string>
        t.equal(fst(tuple), 4)
        t.equal(snd(tuple), 'ABC')
    })

    t.test('Functor with Promise', async (t) => {
        const promiseReader = reader((env: string) => Promise.resolve(env.length) as PromiseBox<number>)

        const result = functor.fmap(
            (p: PromiseBox<number>) => promiseFunctor.fmap((x: number) => x + 1, p),
            promiseReader,
        )

        t.equal(await (result.runReader('abc') as PromiseBox<number>), 4)
    })

    t.test('Functor first law: fmap id = id', async (t) => {
        const result = fmapId(lengthReader)
        const expected = id(lengthReader)

        const envs = ['test', 'abcd']
        envs.forEach((env) => {
            t.equal(result.runReader(env), expected.runReader(env))
        })
    })

    t.test('Functor second law: fmap (f . g) = fmap f . fmap g', async (t) => {
        const a = (x: number) => x + 2
        const b = (x: number) => x * 3
        const ab = compose(a, b)
        const fA = (fa: ReaderBox<string, number>) => functor.fmap(a, fa)
        const fB = (fb: ReaderBox<string, number>) => functor.fmap(b, fb)
        const fAB = (fab: ReaderBox<string, number>) => functor.fmap(ab, fab)
        const fAfB = compose(fA, fB)

        const one = fAB(lengthReader)
        const two = fAfB(lengthReader)

        const envs = ['abcd', 'abcde']
        envs.forEach((env) => {
            t.equal(two.runReader(env), one.runReader(env))
        })
    })
})
