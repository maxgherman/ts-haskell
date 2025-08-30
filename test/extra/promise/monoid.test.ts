import tap from 'tap'
import { compose } from 'ghc/base/functions'
import { cons, nil, toArray, ListBox, List } from 'ghc/base/list/list'
import { monoid as createMonoid } from 'extra/promise/monoid'
import { PromiseBox } from 'extra/promise/promise'
import { monoid as listMonoid } from 'ghc/base/list/monoid'

const innerMonoid = listMonoid<number>()
const monoid = createMonoid<ListBox<number>>(innerMonoid)

tap.test('PromiseMonoid', async (t) => {
    t.test('mempty', async (t) => {
        await monoid.mempty.then((data) => {
            t.same(toArray(data), [])
        })
    })

    t.test('<>', async (t) => {
        const part1 = Promise.resolve(compose(cons<number>(1), cons<number>(2), cons<number>(3))(nil())) as PromiseBox<
            ListBox<number>
        >
        const part2 = Promise.resolve(compose(cons<number>(4), cons<number>(5), cons<number>(6))(nil())) as PromiseBox<
            ListBox<number>
        >
        const part3 = Promise.resolve(nil<number>()) as PromiseBox<ListBox<number>>

        const result1 = monoid['<>'](part1, part2)
        const result2 = monoid['<>'](part1, part3)
        const result3 = monoid['<>'](part3, part3)

        await Promise.all([result1, result2, result3]).then(([value1, value2, value3]) => {
            t.same(toArray(value1), [1, 2, 3, 4, 5, 6])
            t.same(toArray(value2), [1, 2, 3])
            t.same(toArray(value3), [])
        })
    })

    t.test('mappend', async (t) => {
        const part1 = Promise.resolve(compose(cons<number>(1), cons<number>(2), cons<number>(3))(nil())) as PromiseBox<
            ListBox<number>
        >
        const part2 = Promise.resolve(compose(cons<number>(4), cons<number>(5), cons<number>(6))(nil())) as PromiseBox<
            ListBox<number>
        >
        const part3 = Promise.resolve(nil<number>()) as PromiseBox<ListBox<number>>

        const result1 = monoid.mappend(part1, part2)
        const result2 = monoid.mappend(part1, part3)
        const result3 = monoid.mappend(part3, part3)

        await Promise.all([result1, result2, result3]).then(([value1, value2, value3]) => {
            t.same(toArray(value1), [1, 2, 3, 4, 5, 6])
            t.same(toArray(value2), [1, 2, 3])
            t.same(toArray(value3), [])
        })
    })

    t.test('mconcat', async (t) => {
        const part1 = Promise.resolve(compose(cons<number>(1), cons<number>(2))(nil()))
        const part2 = Promise.resolve(compose(cons(3))(nil()))
        const part3 = Promise.resolve(nil<number>())

        const list = compose(
            cons<Promise<ListBox<number>>>(part1),
            cons<Promise<ListBox<number>>>(part2),
            cons<Promise<ListBox<number>>>(part3),
        )(nil()) as List<PromiseBox<ListBox<number>>>
        const result1 = monoid.mconcat(list)
        const result2 = monoid.mconcat(nil())

        await Promise.all([result1, result2]).then(([value1, value2]) => {
            t.same(toArray(value1), [1, 2, 3])
            t.same(toArray(value2), [])
        })
    })

    t.test('Monoid law - associativity : (x <> y) <> z = x <> (y <> z)', async (t) => {
        const part1 = Promise.resolve(compose(cons<number>(1), cons(2))(nil())) as PromiseBox<ListBox<number>>
        const part2 = Promise.resolve(compose(cons(3))(nil())) as PromiseBox<ListBox<number>>
        const part3 = Promise.resolve(compose(cons<number>(4), cons(5))(nil())) as PromiseBox<ListBox<number>>

        const result1 = monoid['<>'](monoid['<>'](part1, part2), part3)
        const result2 = monoid['<>'](part1, monoid['<>'](part2, part3))

        await Promise.all([result1, result2]).then(([value1, value2]) => {
            t.same(toArray(value1), [1, 2, 3, 4, 5])
            t.same(toArray(value1), toArray(value2))
        })
    })

    t.test('Monoid law - right identity: mempty <> x = x', async (t) => {
        const part1 = Promise.resolve(compose(cons<number>(1), cons(2))(nil())) as PromiseBox<ListBox<number>>
        const part2 = Promise.resolve(nil<number>()) as PromiseBox<ListBox<number>>

        const result1 = monoid['<>'](monoid.mempty, part1)
        const result2 = monoid['<>'](monoid.mempty, part2)

        await Promise.all([result1, result2, part1, part2]).then(([value1, value2, part1, part2]) => {
            t.same(toArray(value1), toArray(part1))
            t.same(toArray(value2), toArray(part2))
        })
    })

    t.test('Monoid law - left identity: x <> mempty = x', async (t) => {
        const part1 = Promise.resolve(compose(cons<number>(1), cons(2))(nil())) as PromiseBox<ListBox<number>>
        const part2 = Promise.resolve(nil<number>()) as PromiseBox<ListBox<number>>

        const result1 = monoid['<>'](part1, monoid.mempty)
        const result2 = monoid['<>'](part2, monoid.mempty)

        await Promise.all([result1, result2, part1, part2]).then(([value1, value2, part1, part2]) => {
            t.same(toArray(value1), toArray(part1))
            t.same(toArray(value2), toArray(part2))
        })
    })
})
