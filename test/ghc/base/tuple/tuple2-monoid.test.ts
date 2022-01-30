import tap from 'tap'
import { compose } from 'ghc/base/functions'
import { monoid as createMonoid } from 'ghc/base/tuple/tuple2-monoid'
import { TupleMinBox } from 'ghc/base/tuple/tuple2-semigroup'
import { tuple2, fst, snd } from 'ghc/base/tuple/tuple'
import { monoid as listMonoid } from 'ghc/base/list/monoid'
import { cons, ListBox, nil, toArray } from 'ghc/base/list/list'

const monoid = createMonoid(listMonoid<number>(), listMonoid<string>())

const toList = <T>(value: NonNullable<T>[]) => value.reduceRight((acc, curr) => cons(curr)(acc), nil<T>())

const getValue = (value: TupleMinBox<ListBox<number>, ListBox<string>>) => [
    toArray(fst(value) as ListBox<number>),
    toArray(snd(value) as ListBox<number>),
]

tap.test('Tuple2Monoid', async (t) => {
    t.test('mempty', async (t) => {
        t.same(getValue(monoid.mempty), [[], []])
    })

    t.test('<>', async (t) => {
        const pair1 = tuple2(toList([1, 2]), toList(['1', '2']))
        const pair2 = tuple2(toList([3, 4]), toList(['3', '4']))

        const result = monoid['<>'](pair1, pair2)

        t.same(getValue(result), [
            [1, 2, 3, 4],
            ['1', '2', '3', '4'],
        ])
    })

    t.test('mappend', async (t) => {
        const pair1 = tuple2(toList([1, 2]), toList(['1', '2']))
        const pair2 = tuple2(toList([3, 4]), toList(['3', '4']))

        const result = monoid.mappend(pair1, pair2)

        t.same(getValue(result), [
            [1, 2, 3, 4],
            ['1', '2', '3', '4'],
        ])
    })

    t.test('mconcat', async (t) => {
        const pair1 = tuple2(toList([1, 2]), toList(['1', '2']))
        const pair2 = tuple2(toList([3, 4]), toList(['3', '4']))

        const list = compose(cons(pair1), cons(pair2))(nil())

        const result1 = monoid.mconcat(nil())
        const result2 = monoid.mconcat(list)

        t.same(getValue(result1), [[], []])

        t.same(getValue(result2), [
            [1, 2, 3, 4],
            ['1', '2', '3', '4'],
        ])
    })

    t.test('Monoid law - associativity : (x <> y) <> z = x <> (y <> z)', async (t) => {
        const partNil = tuple2(nil<number>(), nil<string>())
        const pair1 = tuple2(toList([1, 2]), toList(['1', '2']))
        const pair2 = tuple2(toList([3, 4]), toList(['3', '4']))
        const pair3 = tuple2(toList([5, 6]), toList(['5', '6']))

        const result1 = monoid.mappend(monoid.mappend(partNil, partNil), partNil)
        const result2 = monoid.mappend(partNil, monoid.mappend(partNil, partNil))

        const result3 = monoid.mappend(monoid.mappend(pair1, pair2), pair3)
        const result4 = monoid.mappend(pair1, monoid.mappend(pair2, pair3))

        t.same(getValue(result1), [[], []])
        t.same(getValue(result2), [[], []])

        t.same(getValue(result3), [
            [1, 2, 3, 4, 5, 6],
            ['1', '2', '3', '4', '5', '6'],
        ])

        t.same(getValue(result4), [
            [1, 2, 3, 4, 5, 6],
            ['1', '2', '3', '4', '5', '6'],
        ])
    })

    t.test('Monoid law - right identity: mempty <> x = x', async (t) => {
        const pair1 = tuple2(toList([1, 2]), toList(['3', '4']))

        const result = monoid['<>'](monoid.mempty, pair1)

        t.same(getValue(result), [
            [1, 2],
            ['3', '4'],
        ])
    })

    t.test('Monoid law - left identity: x <> mempty = x', async (t) => {
        const pair1 = tuple2(toList([1, 2]), toList(['3', '4']))

        const result = monoid['<>'](pair1, monoid.mempty)

        t.same(getValue(result), [
            [1, 2],
            ['3', '4'],
        ])
    })
})
