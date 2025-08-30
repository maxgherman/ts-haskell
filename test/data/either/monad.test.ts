import tap from 'tap'
import { id } from 'ghc/base/functions'
import { monad as createMonad } from 'data/either/monad'
import { left, right, $case, EitherBox } from 'data/either/either'
import { doNotation } from 'ghc/base/monad/do-notation'

const monad = createMonad<Error>()

const getValue = (value: EitherBox<Error, unknown>): unknown | Error =>
    $case<Error, unknown, unknown | Error>({
        left: id,
        right: id,
    })(value)

tap.test('Either monad', async (t) => {
    t.test('return', async (t) => {
        const result = monad.pure(3)

        t.same(getValue(result), 3)
    })

    t.test('>>=', async (t) => {
        const value1 = right<Error, number>(3)
        const value2 = left<Error, number>(new Error('test'))
        const f1 = (x: number) => right<Error, number>(x * 2)
        const f2 = (x: number) => left<Error, number>(new Error(x.toString()))

        const result1 = monad['>>='](value1, f1)
        const result2 = monad['>>='](value2, f1)
        const result3 = monad['>>='](value1, f2)

        t.equal(getValue(result1), 6)
        t.equal((getValue(result2) as Error).message, 'test')
        t.equal((getValue(result3) as Error).message, '3')
    })

    t.test('>>', async (t) => {
        const value1 = right<Error, number>(3)
        const value2 = right<Error, number>(5)
        const value3 = left<Error, number>(new Error('test'))

        const result1 = monad['>>'](value1, value2)
        const result2 = monad['>>'](value1, value3)
        const result3 = monad['>>'](value3, value1)

        t.equal(getValue(result1), 5)
        t.equal((getValue(result2) as Error).message, 'test')
        t.equal((getValue(result3) as Error).message, 'test')
    })

    t.test('Monad first law (Left identity): return a >>= h = h a', async (t) => {
        const a = 123
        const returnA = monad.return(a)
        const h1 = (x: number) => right<Error, number>(x / 2)
        const h2 = (x: number) => left<Error, number>(new Error(x.toString()))

        const left1 = monad['>>='](returnA, h1)
        const right1 = h1(a)

        const left2 = monad['>>='](returnA, h2)
        const right2 = h2(a)

        t.equal(getValue(left1), getValue(right1))
        t.equal(getValue(left1), 123 / 2)

        t.equal((getValue(left2) as Error).message, (getValue(right2) as Error).message)
        t.equal((getValue(left2) as Error).message, '123')
    })

    t.test('Monad second law (Right identity): m >>= return = m', async (t) => {
        const m1 = right<Error, number>(3)
        const m2 = left<Error, number>(new Error('test'))

        const left1 = monad['>>='](m1, monad.return)
        const left2 = monad['>>='](m2, monad.return)

        t.equal(getValue(left1), getValue(m1))
        t.equal(getValue(left1), 3)

        t.equal(getValue(left2), getValue(m2))
        t.equal((getValue(left2) as Error).message, 'test')
    })

    t.test('Monad thrird law (Associativity): (m >>= g) >>=	h =	m >>= ((x) -> g x >>= h)', async (t) => {
        const m1 = right<Error, number>(3)
        const m2 = left<Error, number>(new Error('test'))
        const g = (x: number) => right<Error, number>(x + 1)
        const h = (x: number) => right<Error, number>(x + 2)

        const left1 = monad['>>='](monad['>>='](m1, g), h)
        const right1 = monad['>>='](m1, (x: number) => monad['>>='](g(x), h))

        const left2 = monad['>>='](monad['>>='](m2, g), h)
        const right2 = monad['>>='](m2, (x: number) => monad['>>='](g(x), h))

        t.equal(getValue(left1), getValue(right1))
        t.equal(getValue(left1), 6)

        t.equal((getValue(left2) as Error).message, (getValue(right2) as Error).message)
        t.equal((getValue(left2) as Error).message, 'test')
    })

    t.test('do-notation', async (t) => {
        const result1 = doNotation<EitherBox<Error, number>>(function* (): Generator<
            EitherBox<Error, number>,
            number,
            number
        > {
            const value1 = yield right(3)
            const value2 = yield right(7)
            return value1 + value2
        }, monad)

        const result2 = doNotation<EitherBox<Error, number>>(function* (): Generator<
            EitherBox<Error, number>,
            number,
            number
        > {
            const value1 = yield left(new Error('test'))
            const value2 = yield right(3)
            return value1 + value2
        }, monad)

        t.equal(getValue(result1), 10)
        t.equal((getValue(result2) as Error).message, 'test')
    })
})
