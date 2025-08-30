import tap from 'tap'
import { compose } from 'ghc/base/functions'
import { cons, nil, toArray, repeat, take, List } from 'ghc/base/list/list'
import { comp } from 'ghc/base/list/comprehension'

tap.test('List comprehensions', async (t) => {
    t.test('comp empty list', async (t) => {
        const list = nil<number>()

        const result1 = comp((x: number) => x + 1, [list])
        const result2 = comp((x: number) => x + 1, [] as unknown as [List<number>])

        t.same(toArray(result1), [])
        t.same(toArray(result2), [NaN])
    })

    t.test('comp finite list', async (t) => {
        const list = compose(cons<number>(1), cons<number>(2), cons(3))(nil())

        const result = comp((x: number) => x + 1, [list])

        t.same(toArray(result), [2, 3, 4])
    })

    t.test('comp finite lists', async (t) => {
        const list1 = compose(cons<number>(1), cons(2))(nil())
        const list2 = compose(cons<number>(3))(nil())
        const list3 = compose(cons<number>(5), cons<number>(6), cons(7))(nil())

        const result = comp((x1: number, x2: number, x3: number) => `${x1} ${x2} ${x3}`, [list1, list2, list3])

        t.same(toArray(result), ['1 3 5', '1 3 6', '1 3 7', '2 3 5', '2 3 6', '2 3 7'])
    })

    t.test('comp infinite list', async (t) => {
        const list = repeat(3)

        const result = comp((x: number) => x + 2, [list])
        const value = compose(toArray, (list: List<number>) => take(5, list))(result)

        t.same(value, [5, 5, 5, 5, 5])
    })

    t.test('comp infinite lists', async (t) => {
        const list1 = repeat(3)
        const list2 = repeat(5)

        const result = comp((x1: number, x2: number) => x1 + x2, [list1, list2])
        const value = compose(toArray, (list: List<number>) => take(3, list))(result)

        t.same(value, [8, 8, 8])
    })

    t.test('comp mixed list', async (t) => {
        const list1 = repeat(3)
        const list2 = compose(cons<number>(1), cons(2))(nil())

        const result = comp((x1: number, x2: number) => [x1, x2], [list1, list2])
        const value = compose(toArray, (list: List<number[]>) => take(5, list))(result)

        t.same(value, [
            [3, 1],
            [3, 2],
            [3, 1],
            [3, 2],
            [3, 1],
        ])
    })

    t.test('composite comprehensions', async (t) => {
        const list1 = compose(cons<number>(1), cons(2))(nil())
        const list2 = compose(cons<number>(3), cons(4))(nil())
        const list3 = compose(cons<number>(5), cons(6))(nil())

        const comp1 = comp((x1: number, x2: number) => `${x1} - ${x2}`, [list1, list2])
        const result = comp((x1: string, x2: number) => `${x1} | ${x2}`, [comp1, list3])

        t.same(toArray(result), [
            '1 - 3 | 5',
            '1 - 3 | 6',
            '1 - 4 | 5',
            '1 - 4 | 6',
            '2 - 3 | 5',
            '2 - 3 | 6',
            '2 - 4 | 5',
            '2 - 4 | 6',
        ])
    })

    t.test('comp filters', async (t) => {
        const list1 = compose(cons<number>(1), cons(2))(nil())
        const list2 = compose(cons<number>(3))(nil())
        const list3 = compose(cons<number>(5), cons<number>(6), cons(7))(nil())

        const result = comp(
            (x1: number, x2: number, x3: number) => `${x1} ${x2} ${x3}`,
            [list1, list2, list3],
            [(x1: number, x2: number, x3: number) => x1 + x2 + x3 > 10],
        )

        t.same(toArray(result), ['1 3 7', '2 3 6', '2 3 7'])
    })

    t.test('comp filters empty list', async (t) => {
        const list = nil<number>()

        const result = comp((x1: number) => x1, [list], [(x1: number) => x1 > 10])

        t.same(toArray(result), [])
    })

    t.test('comp multiple filters', async (t) => {
        const list1 = compose(cons<number>(1), cons(2))(nil())
        const list2 = compose(cons<number>(3))(nil())
        const list3 = compose(cons<number>(5), cons<number>(6), cons(7))(nil())

        const result = comp(
            (x1: number, x2: number, x3: number) => `${x1} ${x2} ${x3}`,
            [list1, list2, list3],
            [(x1: number, x2: number, x3: number) => x1 + x2 + x3 > 10, (_, x2: number, x3: number) => x2 + x3 === 10],
        )

        t.same(toArray(result), ['1 3 7', '2 3 7'])
    })

    t.test('comp list kind', async (t) => {
        const list = compose(cons<number>(1), cons<number>(2), cons(3))(nil())

        const result = comp((x: number) => x + 1, [list])

        t.equal(result.kind('*' as '*' & ((_: '*') => '*')), '*')
    })
})
