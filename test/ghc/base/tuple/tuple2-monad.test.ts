import tap from 'tap'
import { compose } from 'ghc/base/functions'
import { monad as createMonad } from 'ghc/base/tuple/tuple2-monad'
import { monoid as createMonoid } from 'ghc/base/list/monoid'
import { doNotation } from 'ghc/base/monad/do-notation'
import { toArray, ListBox, cons, nil } from 'ghc/base/list/list'
import { tuple2, Tuple2BoxT } from 'ghc/base/tuple/tuple'

const monoid = createMonoid<number>()
const monad = createMonad(monoid)

tap.test('Tuple2 monad', async (t) => {
    t.test('return', async (t) => {
        const result = monad.pure(3)
        const [a, b] = result

        t.same(toArray(a as ListBox<number>), [])
        t.equal(b, 3)
    })

    t.test('>>=', async (t) => {
        const list = tuple2(compose(cons(1), cons(2))(nil()), 1)
        const f = (x: number) => tuple2(compose(cons(x - 1), cons(x), cons(x + 1))(nil()), 3)

        const [first, second] = monad['>>='](list, f)

        t.same(toArray(first as ListBox<number>), [1, 2, 0, 1, 2])
        t.equal(second, 3)
    })

    t.test('>>', async (t) => {
        const list1: Tuple2BoxT<ListBox<number>, number> = tuple2(compose(cons(1), cons(2))(nil()), 5)
        const list2: Tuple2BoxT<ListBox<number>, number> = tuple2(compose(cons(4), cons(5), cons(6))(nil()), 7)

        const [first, second] = monad['>>'](list1, list2)

        t.same(toArray(first as ListBox<number>), [1, 2, 4, 5, 6])
        t.equal(second, 7)
    })

    t.test('Monad first law (Left identity): return a >>= h = h a', async (t) => {
        const a = 123
        const returnA = monad.return(a)
        const h = (x: number) => tuple2(compose(cons(x / 2))(nil()), 1)

        const [leftFirst, leftSecond] = monad['>>='](returnA, h)
        const [rightFirst, rightSecond] = h(a)

        t.same(toArray(leftFirst as ListBox<number>), toArray(rightFirst as ListBox<number>))
        t.equal(leftSecond, rightSecond)

        t.same(toArray(leftFirst as ListBox<number>), [123 / 2])
        t.equal(leftSecond, 1)
    })

    t.test('Monad second law (Right identity): m >>= return = m', async (t) => {
        const m = tuple2(compose(cons(1), cons(2), cons(3))(nil()), 'test')

        const [first, second] = monad['>>='](m, monad.return)
        const [mFirst, mSecond] = m

        t.same(toArray(first as ListBox<number>), toArray(mFirst))
        t.equal(second, mSecond)

        t.same(toArray(first as ListBox<number>), [1, 2, 3])
        t.equal(second, 'test')
    })

    t.test('Monad thrird law (Associativity): (m >>= g) >>=	h =	m >>= ((x) -> g x >>= h)', async (t) => {
        const m = tuple2(compose(cons(1), cons(2), cons(3))(nil()), 1)
        const g = (x: number) => tuple2(compose(cons(x), cons(x + x))(nil()), 2) as Tuple2BoxT<ListBox<number>, number>
        const h = (x: number) =>
            tuple2(compose(cons(x + 1), cons(x + 2))(nil()), 3) as Tuple2BoxT<ListBox<number>, number>

        const [leftFirst, leftSecond] = monad['>>='](monad['>>='](m, g), h)
        const [rightFirst, rightSecond] = monad['>>='](m, (x: number) => monad['>>='](g(x), h))

        t.same(toArray(rightFirst as ListBox<number>), toArray(leftFirst as ListBox<number>))
        t.equal(leftSecond, rightSecond)

        t.same(toArray(leftFirst as ListBox<number>), [1, 2, 3, 1, 2, 3, 4])
        t.equal(leftSecond, 3)
    })

    t.test('do-notation', async (t) => {
        const [first, second] = doNotation<Tuple2BoxT<ListBox<number>, number>>(function* (): Generator<
            Tuple2BoxT<ListBox<number>, number>,
            number,
            number
        > {
            const value1 = yield tuple2(cons(5)(cons(6)(nil())), 10)
            const value2 = yield tuple2(cons(7)(cons(8)(nil())), 11)

            return value1 + value2
        },
        monad)

        t.same(toArray(first as ListBox<number>), [5, 6, 7, 8])
        t.equal(second, 21)
    })
})
