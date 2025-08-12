import tap from 'tap'
import { monad as createMonad } from 'control/reader/monad'
import { reader, ReaderBox } from 'control/reader/reader'
import { doNotation } from 'ghc/base/monad/do-notation'

const monad = createMonad<string>()

const run = <A>(r: ReaderBox<string, A>, env: string) => r.runReader(env)

tap.test('Reader monad', async (t) => {
    t.test('return', async (t) => {
        const result = monad.pure(3)

        t.equal(run(result, 'env'), 3)
    })

    t.test('>>=', async (t) => {
        const value = reader((env: string) => env.length)
        const f = (x: number) => reader((env: string) => x + env.length)

        const result = monad['>>='](value, f)

        t.equal(run(result, 'abcd'), 8)
    })

    t.test('>>', async (t) => {
        const value1 = reader((env: string) => env.length)
        const value2 = reader((env: string) => env.toUpperCase())

        const result = monad['>>'](value1, value2)

        t.equal(run(result, 'abc'), 'ABC')
    })

    t.test('Monad first law (Left identity): return a >>= h = h a', async (t) => {
        const a = 5
        const returnA = monad.return(a)
        const h = (x: number) => reader((env: string) => x + env.length)

        const left = monad['>>='](returnA, h)
        const right = h(a)

        t.equal(run(left, 'abcd'), run(right, 'abcd'))
        t.equal(run(right, 'abcd'), 9)
    })

    t.test('Monad second law (Right identity): m >>= return = m', async (t) => {
        const m = reader((env: string) => env.length)
        const left = monad['>>='](m, monad.return)

        t.equal(run(left, 'abcd'), run(m, 'abcd'))
        t.equal(run(left, 'abcd'), 4)
    })

    t.test('Monad thrird law (Associativity): (m >>= g) >>= h = m >>= (x -> g x >>= h)', async (t) => {
        const m = reader((env: string) => env.length)
        const g = (x: number) => reader((env: string) => x + env.length)
        const h = (x: number) => reader((env: string) => x * 2)

        const left = monad['>>='](monad['>>='](m, g), h)
        const right = monad['>>='](m, (x: number) => monad['>>='](g(x), h))

        t.equal(run(left, 'abc'), run(right, 'abc'))
        t.equal(run(left, 'abc'), 12)
    })

    t.test('do-notation', async (t) => {
        const result = doNotation<ReaderBox<string, number>>(function* (): Generator<
            ReaderBox<string, number>,
            number,
            number
        > {
            const value1 = (yield reader((env: string) => env.length)) as number
            const value2 = (yield reader((env: string) => env.length * 2)) as number
            return value1 + value2
        },
        monad)

        t.equal(run(result, 'abcd'), 12)
    })
})

