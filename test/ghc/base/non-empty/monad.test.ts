import tap from 'tap'
import { compose } from 'ghc/base/functions'
import { monad } from 'ghc/base/non-empty/monad'
import { ListBox, toArray as listToArray, cons, nil, repeat, take } from 'ghc/base/list/list'
import { NonEmptyBox, toList, fromList } from 'ghc/base/non-empty/list'
import { doNotation } from 'ghc/base/monad/do-notation'

const toArray = <T>(x: NonEmptyBox<T>) => compose<NonEmptyBox<T>, ListBox<T>, T[]>(listToArray, toList)(x)

tap.test('NonEmpty monad', async (t) => {
    t.test('return', async (t) => {
        const result = monad.pure(3)
        t.same(toArray(result), [3])
    })

    t.test('>>=', async (t) => {
        const list = compose(fromList, cons<number>(1), cons<number>(2), cons<number>(3))(nil())
        const f = (x: number) => compose(fromList, cons(x - 1), cons(x), cons(x + 1))(nil())

        const result = monad['>>='](list, f)

        t.same(toArray(result), [0, 1, 2, 1, 2, 3, 2, 3, 4])
    })

    t.test('>>', async (t) => {
        const list1 = compose(fromList, cons<number>(1), cons(2))(nil())
        const list2 = compose(fromList, cons<number>(4), cons<number>(5), cons(6))(nil())

        const result1 = monad['>>'](list1, list2)

        t.same(toArray(result1), [4, 5, 6, 4, 5, 6])
    })

    t.test('Monad first law (Left identity): return a >>= h = h a', async (t) => {
        const a = 123
        const returnA = monad.return(a)
        const h = (x: number) => compose(fromList, cons(x / 2))(nil())

        const left = monad['>>='](returnA, h)
        const right = h(a)

        t.same(toArray(left), toArray(right))
        t.same(toArray(left), [61.5])
    })

    t.test('Monad second law (Right identity): m >>= return = m', async (t) => {
        const m = compose(fromList, cons<number>(1), cons<number>(2), cons(3))(nil())

        const left = monad['>>='](m, monad.return)

        t.same(toArray(left), toArray(m))
        t.same(toArray(m), [1, 2, 3])
    })

    t.test('Monad thrird law (Associativity): (m >>= g) >>=	h =	m >>= ((x) -> g x >>= h)', async (t) => {
        const m = compose(fromList, cons<number>(1), cons<number>(2), cons<number>(3))(nil())
        const g = (x: number) => compose(fromList, cons(x), cons(x - 2))(nil())
        const h = (x: number) => compose(fromList, cons(x + 1), cons(x + 2))(nil())

        const left = monad['>>='](monad['>>='](m, g), h)
        const right = monad['>>='](m, (x: number) => monad['>>='](g(x), h))

        t.same(toArray(left), toArray(right))
        t.same(toArray(left), [2, 3, 0, 1, 3, 4, 1, 2, 4, 5, 2, 3])
    })

    t.test('do-notation', async (t) => {
        const result1 = doNotation<NonEmptyBox<number>>(function* (): Generator<NonEmptyBox<number>, number, number> {
            const value1 = yield compose(fromList, cons<number>(5), cons(6))(nil())
            const value2 = yield compose(fromList, cons<number>(7), cons(8))(nil())
            return value1 + value2
        }, monad)

        const result2 = doNotation<NonEmptyBox<number>>(function* (): Generator<NonEmptyBox<number>, number, number> {
            const value1 = yield fromList(repeat(3))
            const value2 = yield compose(fromList, cons<number>(7), cons(8))(nil())
            return value1 + value2
        }, monad)

        t.same(toArray(result1), [12, 13, 13, 14])
        t.same(toArray(fromList(take(5, toList(result2)))), [10, 11, 10, 11, 10])
    })
})
