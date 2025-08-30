import tap from 'tap'
import { compose } from 'ghc/base/functions'
import { semigroup as createSemigroup } from 'ghc/base/list/semigroup'
import { cons, ListBox, nil, toArray } from 'ghc/base/list/list'
import { fromList } from 'ghc/base/non-empty/list'

const semigroup = createSemigroup<number>()

const createList = (value: number) => cons(value)(nil())

tap.test('ListSemigroup', async (t) => {
    t.test('<>', async (t) => {
        const result1 = semigroup['<>'](nil(), nil())
        const result2 = semigroup['<>'](nil(), cons<number>(1)(cons(2)(nil())))
        const result3 = semigroup['<>'](cons<number>(1)(cons<number>(2)(nil())), nil())
        const result4 = semigroup['<>'](cons<number>(1)(cons(2)(nil())), cons(3)(nil()))
        const result5 = semigroup['<>'](cons<number>(3)(nil()), cons<number>(1)(cons(2)(nil())))

        t.same(toArray(result1), [])
        t.same(toArray(result2), [1, 2])
        t.same(toArray(result3), [1, 2])
        t.same(toArray(result4), [1, 2, 3])
        t.same(toArray(result5), [3, 1, 2])
    })

    t.test('sconcat', async (t) => {
        const innerList1 = cons(createList(1))(nil())
        const innerList2 = compose(cons(createList(1)), cons(createList(2)), cons(createList(3)))(nil())

        const data1 = fromList(innerList1)
        const data2 = fromList(innerList2)

        const result1 = semigroup.sconcat(data1)
        const result2 = semigroup.sconcat(data2)

        t.same(toArray(result1), [1])
        t.same(toArray(result2), [1, 2, 3])
    })

    t.test('stimes', async (t) => {
        const result1 = compose((x: ListBox<number>) => semigroup.stimes(10, x), cons(1))(nil())

        const result2 = compose(
            (x: ListBox<number>) => semigroup.stimes(0, x),
            cons<number>(1),
            cons<number>(2),
            cons(3),
        )(nil())

        const result3 = semigroup.stimes(20, nil())
        const result4 = () => semigroup.stimes(-1, nil())

        t.same(toArray(result1), [1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
        t.same(toArray(result2), [1, 2, 3])
        t.same(toArray(result3), [])
        t.throws(result4)
    })

    t.test('semigroup law - associativity: (x <> y) <> z = x <> (y <> z)', async (t) => {
        const empty = nil<number>()
        const list1 = compose(cons<number>(1), cons<number>(2), cons<number>(3))(nil())
        const list2 = compose(cons<number>(4), cons<number>(5))(nil())
        const list3 = compose(cons<number>(6))(nil())

        const result1 = compose(
            (x: ListBox<number>) => semigroup['<>'](x, empty),
            (x: ListBox<number>) => semigroup['<>'](empty, x),
        )(empty)

        const result2 = compose(
            (x: ListBox<number>) => semigroup['<>'](empty, x),
            (x: ListBox<number>) => semigroup['<>'](empty, x),
        )(empty)

        const result3 = compose(
            (z: ListBox<number>) => semigroup['<>'](z, list3),
            (y: ListBox<number>) => semigroup['<>'](list1, y),
        )(list2)

        const result4 = compose(
            (z: ListBox<number>) => semigroup['<>'](list1, z),
            (y: ListBox<number>) => semigroup['<>'](list2, y),
        )(list3)

        t.same(toArray(result1), toArray(result2))
        t.same(toArray(result1), [])

        t.same(toArray(result3), toArray(result4))
        t.same(toArray(result3), [1, 2, 3, 4, 5, 6])
    })
})
