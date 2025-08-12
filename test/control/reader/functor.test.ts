import tap from 'tap'
import { compose, id } from 'ghc/base/functions'
import { functor as createFunctor } from 'control/reader/functor'
import { reader, ReaderBox } from 'control/reader/reader'

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
