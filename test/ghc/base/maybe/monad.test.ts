import tap from 'tap'
import { id } from 'ghc/base/functions'
import { monad } from 'ghc/base/maybe/monad'
import { just, nothing, MaybeBox, $case } from 'ghc/base/maybe/maybe'
import { doNotation } from 'ghc/base/monad/do-notation'

const getValue = <A>(box: MaybeBox<A>): A | undefined =>
    $case<A, A | undefined>({
        nothing: () => undefined,
        just: id,
    })(box)

tap.test('List monad', async (t) => {
    t.test('return', async (t) => {
        const result = monad.pure(3)
        const value = getValue(result)

        t.equal(value, 3)
    })

    t.test('>>=', async (t) => {
        const m1 = just(3)
        const m2 = nothing<number>()
        const f = (x: number) => just(x + 1)

        const result1 = monad['>>='](m1, f)
        const result2 = monad['>>='](m2, f)

        t.equal(getValue(result1), 4)
        t.equal(getValue(result2), undefined)
    })

    t.test('>>', async (t) => {
        const m1 = just(1)
        const m2 = just(2)
        const m3 = nothing<number>()

        const result1 = monad['>>'](m1, m2)
        const result2 = monad['>>'](m1, m3)
        const result3 = monad['>>'](m3, m2)

        t.equal(getValue(result1), 2)
        t.equal(getValue(result2), undefined)
        t.equal(getValue(result3), undefined)
    })

    t.test('Monad first law (Left identity): return a >>= h = h a', async (t) => {
        const a = 123
        const returnA = monad.return(a)
        const h = (x: number) => just(x / 2)

        const left = monad['>>='](returnA, h)
        const right = h(a)

        t.equal(getValue(left), getValue(right))
        t.equal(getValue(left), 61.5)
    })

    t.test('Monad second law (Right identity): m >>= return = m', async (t) => {
        const m1 = just(3)
        const m2 = nothing<string>()

        const left1 = monad['>>='](m1, monad.return)
        const left2 = monad['>>='](m2, monad.return)

        t.equal(getValue(left1), getValue(m1))
        t.same(getValue(m1), 3)

        t.equal(getValue(left2), getValue(m2))
        t.same(getValue(m2), undefined)
    })

    t.test('Monad thrird law (Associativity): (m >>= g) >>=	h =	m >>= ((x) -> g x >>= h)', async (t) => {
        t.test('just', async (t) => {
            const m = just(5)
            const g = (x: number) => just(x - 2)
            const h = (x: number) => just(x * 2)

            const left = monad['>>='](monad['>>='](m, g), h)
            const right = monad['>>='](m, (x: number) => monad['>>='](g(x), h))

            t.equal(getValue(left), getValue(right))
            t.equal(getValue(left), 6)
        })

        t.test('nothing', async (t) => {
            const m = just(5)
            const m1 = nothing<number>()
            const g = (x: number) => just(x - 2)
            const g1 = (_: number) => nothing<number>()
            const h = (x: number) => just(x * 2)
            const h1 = (_: number) => nothing<number>()

            const left1 = monad['>>='](monad['>>='](m1, g), h)
            const right1 = monad['>>='](m1, (x: number) => monad['>>='](g(x), h))

            const left2 = monad['>>='](monad['>>='](m, g1), h)
            const right2 = monad['>>='](m, (x: number) => monad['>>='](g1(x), h))

            const left3 = monad['>>='](monad['>>='](m, g), h1)
            const right3 = monad['>>='](m, (x: number) => monad['>>='](g(x), h1))

            t.equal(getValue(left1), getValue(right1))
            t.equal(getValue(left1), undefined)

            t.equal(getValue(left2), getValue(right2))
            t.equal(getValue(left2), undefined)

            t.equal(getValue(left3), getValue(right3))
            t.equal(getValue(left3), undefined)
        })
    })

    t.test('do-notation', async (t) => {
        const result = doNotation<MaybeBox<number>>(function* (): Generator<MaybeBox<number>, number, number> {
            const value1 = yield just(5)
            const value2 = yield just(6)
            const value3 = yield just(7)
            return value1 + value2 + value3
        }, monad)

        t.equal(getValue(result), 5 + 6 + 7)
    })
})
