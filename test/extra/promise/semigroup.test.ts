import tap from 'tap'
import { compose } from 'ghc/base/functions'
import { PromiseBox } from 'extra/promise/promise'
import { semigroup as createSemigroup } from 'extra/promise/semigroup'
import { semigroup as listSemigroup } from 'ghc/base/list/semigroup'
import { cons, nil, ListBox, toArray } from 'ghc/base/list/list'
import { formList } from 'ghc/base/non-empty/list'

const innerSemigroup = listSemigroup<number>()
const semigroup = createSemigroup<ListBox<number>>(innerSemigroup)

tap.test('PromiseSemigroup', async (t) => {
    t.test('<>', async (t) => {
        const part1 = Promise.resolve(compose(cons(1), cons(2), cons(3))(nil<number>())) as PromiseBox<ListBox<number>>
        const part2 = Promise.resolve(compose(cons(4), cons(5), cons(6))(nil<number>())) as PromiseBox<ListBox<number>>

        const result = semigroup['<>'](part1, part2)

        await result.then((data) => {
            t.same(toArray(data), [1, 2, 3, 4, 5, 6])
        })
    })

    t.test('sconcat', async (t) => {
        const part1 = Promise.resolve(compose(cons(1), cons(2))(nil<number>())) as PromiseBox<ListBox<number>>
        const part2 = Promise.resolve(compose(cons(3), cons(4))(nil<number>())) as PromiseBox<ListBox<number>>
        const part3 = Promise.resolve(compose(cons(5), cons(6))(nil<number>())) as PromiseBox<ListBox<number>>

        const value = formList(compose(cons(part1), cons(part2), cons(part3))(nil<PromiseBox<ListBox<number>>>()))

        const result = semigroup.sconcat(value)

        await result.then((data) => {
            t.same(toArray(data), [1, 2, 3, 4, 5, 6])
        })
    })

    t.test('stimes', async (t) => {
        const partNil = Promise.resolve(nil<number>()) as PromiseBox<ListBox<number>>
        const part1 = Promise.resolve(compose(cons(1), cons(2))(nil<number>())) as PromiseBox<ListBox<number>>

        const result1 = semigroup.stimes(3, partNil)
        const result2 = semigroup.stimes(3, part1)

        await result1.then((data) => {
            t.same(toArray(data), [])
        })

        await result2.then((data) => {
            t.same(toArray(data), [1, 2, 1, 2, 1, 2])
        })
    })

    t.test('semigroup law: (x <> y) <> z = x <> (y <> z)', async (t) => {
        const part1 = Promise.resolve(compose(cons(1), cons(2))(nil<number>())) as PromiseBox<ListBox<number>>
        const part2 = Promise.resolve(compose(cons(3), cons(4))(nil<number>())) as PromiseBox<ListBox<number>>
        const part3 = Promise.resolve(compose(cons(5), cons(6))(nil<number>())) as PromiseBox<ListBox<number>>

        const result1 = semigroup['<>'](semigroup['<>'](part1, part2), part3)
        const result2 = semigroup['<>'](part1, semigroup['<>'](part2, part3))

        await result1.then((data) => {
            t.same(toArray(data), [1, 2, 3, 4, 5, 6])
        })

        await result2.then((data) => {
            t.same(toArray(data), [1, 2, 3, 4, 5, 6])
        })
    })
})
