import tap from 'tap'
import { compose } from 'ghc/base/functions'
import { monad } from 'ghc/base/list/monad'
import { toArray, cons, nil, repeat, take, ListBox } from 'ghc/base/list/list'
import { doNotation } from 'ghc/base/monad/do-notation'

tap.test('List monad', async (t) => {
    t.test('return', async (t) => {
        const result = monad.pure(3)

        t.same(toArray(result), [3])
    })

    t.test('>>=', async (t) => {
        const list1 = compose(cons<number>(1), cons<number>(2), cons(3))(nil())
        const list2 = repeat(3)
        const f = (x: number) => compose(cons(x - 1), cons(x), cons(x + 1))(nil())

        const result1 = monad['>>='](list1, f)
        const result2 = take(5, monad['>>='](list2, f))

        result1.kind('*')

        t.same(toArray(result1), [0, 1, 2, 1, 2, 3, 2, 3, 4])
        t.same(toArray(result2), [2, 3, 4, 2, 3])
    })

    t.test('>>', async (t) => {
        const list1 = compose(cons<number>(1), cons(2))(nil())
        const list2 = compose(cons<number>(4), cons<number>(5), cons<number>(6))(nil())
        const list3 = repeat(3)

        const result1 = monad['>>'](list1, list2)
        const result2 = take(5, monad['>>'](list1, list3))
        const result3 = take(5, monad['>>'](list3, list1))

        t.same(toArray(result1), [4, 5, 6, 4, 5, 6])
        t.same(toArray(result2), [3, 3, 3, 3, 3])
        t.same(toArray(result3), [1, 2, 1, 2, 1])
    })

    t.test('Monad first law (Left identity): return a >>= h = h a', async (t) => {
        const a = 123
        const returnA = monad.return(a)
        const h = (x: number) => compose(cons(x / 2))(nil())

        const left = monad['>>='](returnA, h)
        const right = h(a)

        t.same(toArray(left), toArray(right))
        t.same(toArray(left), [61.5])
    })

    t.test('Monad second law (Right identity): m >>= return = m', async (t) => {
        const m = compose(cons<number>(1), cons<number>(2), cons(3))(nil())

        const left = monad['>>='](m, monad.return)

        t.same(toArray(left), toArray(m))
        t.same(toArray(m), [1, 2, 3])
    })

    t.test('Monad thrird law (Associativity): (m >>= g) >>=	h =	m >>= ((x) -> g x >>= h)', async (t) => {
        const m = compose(cons<number>(1), cons<number>(2), cons(3))(nil())
        const g = (x: number) => compose(cons(x), cons(x - 2))(nil())
        const h = (x: number) => compose(cons(x + 1), cons(x + 2))(nil())

        const left = monad['>>='](monad['>>='](m, g), h)
        const right = monad['>>='](m, (x: number) => monad['>>='](g(x), h))

        t.same(toArray(left), toArray(right))
        t.same(toArray(left), [2, 3, 0, 1, 3, 4, 1, 2, 4, 5, 2, 3])
    })

    t.test('do-notation', async (t) => {
        const result1 = doNotation<ListBox<number>>(function* (): Generator<ListBox<number>, number, number> {
            const value1 = yield cons<number>(5)(cons(6)(nil()))
            const value2 = yield cons<number>(7)(cons(8)(nil()))
            return value1 + value2
        }, monad)

        const result2 = doNotation<ListBox<number>>(function* (): Generator<ListBox<number>, number, number> {
            const value1 = yield repeat(3)
            const value2 = yield cons<number>(7)(cons(8)(nil()))
            return value1 + value2
        }, monad)

        const result3 = doNotation<ListBox<number>>(function* (): Generator<ListBox<number>, number, number> {
            const value1 = yield repeat(3)
            const value2 = yield repeat(5)
            return value1 + value2
        }, monad)

        t.same(toArray(result1), [12, 13, 13, 14])
        t.same(toArray(take(5, result2)), [10, 11, 10, 11, 10])
        t.same(toArray(take(5, result3)), [8, 8, 8, 8, 8])
    })
})
