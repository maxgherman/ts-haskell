import tap from 'tap'
import { monad } from 'extra/promise/monad'
import { PromiseBox } from 'extra/promise/promise'
import { doNotation } from 'ghc/base/monad/do-notation'

tap.test('Promise monad', async (t) => {
    t.test('return', async (t) => {
        const result = await monad.pure(3)

        t.equal(result, 3)
    })

    t.test('>>=', async (t) => {
        const value = monad.pure(3)
        const f = (x: number) => monad.pure(x + 5)

        const result = await monad['>>='](value, f)

        t.equal(result, 8)
    })

    t.test('>>', async (t) => {
        const value1 = monad.pure(3)
        const value2 = monad.pure(10)

        const result = await monad['>>'](value1, value2)

        t.equal(result, 10)
    })

    t.test('Monad first law (Left identity): return a >>= h = h a', async (t) => {
        const a = 123
        const returnA = monad.return(a)
        const h = (x: number) => Promise.resolve(x / 2) as PromiseBox<number>

        const left = await monad['>>='](returnA, h)
        const right = await h(a)

        t.equal(left, right)
        t.equal(left, 123 / 2)
    })

    t.test('Monad second law (Right identity): m >>= return = m', async (t) => {
        const m = Promise.resolve(3) as PromiseBox<number>

        const left = await monad['>>='](m, monad.return)

        t.equal(left, 3)
    })

    t.test('Monad thrird law (Associativity): (m >>= g) >>=	h =	m >>= ((x) -> g x >>= h)', async (t) => {
        const m = monad.return(3)
        const g = (x: number) => monad.return(x + 1)
        const h = (x: number) => monad.return(x + 2)

        const left = await monad['>>='](monad['>>='](m, g), h)
        const right = await monad['>>='](m, (x: number) => monad['>>='](g(x), h))

        t.equal(left, right)
        t.equal(left, 6)
    })

    t.test('do-notation', async (t) => {
        const result = await doNotation<PromiseBox<number>>(function* (): Generator<
            PromiseBox<number>,
            number,
            number
        > {
            const value1 = yield Promise.resolve(3) as PromiseBox<number>
            const value2 = yield Promise.resolve(5) as PromiseBox<number>
            return value1 + value2
        },
        monad)

        t.equal(result, 8)
    })
})
