import tap from 'tap'
import { compose, Func } from 'ghc/base/functions'
import { $null, cons as listCons, head as listHead, List, nil, tail as listTail, toArray } from 'ghc/base/list/list'
import { $case, _, cons, formList, head, map, NonEmpty, nonEmpty, tail, toList } from 'ghc/base/non-empty/list'

type KindFunc = Func & { kind: Func }

tap.test('NonEmpty', async (t) => {
    t.test('nonEmpty', async (t) => {
        const value0 = compose(nonEmpty)(nil<number>())
        const value1 = compose(nonEmpty, listCons<number>(1))(nil())
        const value2 = compose(nonEmpty, listCons<number>(1), listCons(2))(nil())
        const value3 = compose(nonEmpty, listCons<number>(1), listCons<number>(2), listCons(3))(nil())

        t.equal(value0(), undefined)

        t.equal(((value1() as Func)() as never[])[0], 1)
        t.ok($null(((value1() as Func)() as never[])[1] as unknown as List<number>))

        t.equal(((value2() as Func)() as never[])[0], 1)
        t.equal(listHead(((value2() as Func)() as never[])[1] as unknown as List<number>), 2)

        t.equal(((value3() as Func)() as never[])[0], 1)
        t.equal(listHead(((value3() as Func)() as never[])[1] as unknown as List<number>), 2)
        t.equal(listHead(listTail(((value3() as Func)() as never[])[1] as unknown as List<number>)), 3)
        t.equal((value1() as KindFunc).kind('*'), '*')
        t.equal((value2() as KindFunc).kind('*'), '*')
        t.equal((value3() as KindFunc).kind('*'), '*')
    })

    t.test('cons', async (t) => {
        const empty = nil<number>()
        const list = listCons<number>(2)(empty)

        const result1 = cons<number>(1)(empty)
        const result2 = cons<number>(1)(list)

        t.equal(head(result1), 1)
        t.equal(head(result2), 1)
        t.same(toArray(tail(result1)), [])
        t.same(toArray(tail(result2)), [2])
        t.equal((result1 as KindFunc).kind('*'), '*')
        t.equal((result2 as KindFunc).kind('*'), '*')
    })

    t.test('head', async (t) => {
        const list: NonEmpty<number> = () => [1, nil<number>()]
        const result = head(list)

        t.equal(result, 1)
    })

    t.test('tail', async (t) => {
        const list1: NonEmpty<number> = () => [1, nil<number>()]
        const list2: NonEmpty<number> = () => [1, listCons<number>(3)(nil())]

        const result1 = tail(list1)
        const result2 = tail(list2)

        t.same(toArray(result1), [])
        t.same(toArray(result2), [3])
    })

    t.test('fromList', async (t) => {
        const list1 = nil<number>()
        const list2 = listCons<number>(2)(listCons<number>(3)(nil()))

        const result2 = formList(list2)

        t.throws(() => formList(list1))
        t.equal(((result2 as Func)() as never[])[0], 2)
        t.equal(listHead(((result2 as Func)() as never[])[1] as unknown as List<number>), 3)
        t.ok($null(listTail(((result2 as Func)() as never[])[1] as unknown as List<number>)))
        t.equal((result2 as KindFunc).kind('*'), '*')
    })

    t.test('toListList', async (t) => {
        const list: NonEmpty<number> = () => [
            0,
            compose(listCons<number>(1), listCons<number>(2), listCons<number>(3))(nil()),
        ]

        const result = toList(list)

        t.same(toArray(result), [0, 1, 2, 3])
    })

    t.test('map', async (t) => {
        const list: NonEmpty<number> = () => [
            0,
            compose(listCons<number>(1), listCons<number>(2), listCons<number>(3))(nil()),
        ]

        const result = map((x) => x + 1, list)

        t.same(toArray(toList(result)), [1, 2, 3, 4])
        t.equal((result as KindFunc).kind('*'), '*')
    })

    t.test('$case', async (t) => {
        const value1 = compose(formList, listCons<number>(1))(nil())
        const value2 = compose(formList, listCons<number>(1), listCons(2))(nil())
        const value3 = compose(formList, listCons<number>(1), listCons<number>(2), listCons<number>(3))(nil())

        const result0 = $case([
            [
                [],
                () => {
                    console.log('No match')
                },
            ],
        ])

        const result1 = $case([
            [
                [],
                () => {
                    throw new Error()
                },
            ],
            [[_], (a) => a + 1],
        ])(value1)

        const result2 = $case([
            [
                [],
                () => {
                    throw new Error()
                },
            ],
            [[_, _], (a, b) => a + b + 1],
            [[_], (a) => a + 1],
        ])(value2)

        const result3 = $case([
            [
                [],
                () => {
                    throw new Error()
                },
            ],
            [[_, _, _], (a, b, c) => a + b + c + 1],
            [[_, _], (a, b) => a + b + 1],
            [[_], (a) => a + 1],
        ])(value3)

        t.throws(() => result0(value1))
        t.equal(result1, 2)
        t.equal(result2, 4)
        t.equal(result3, 7)
    })

    t.test('$case rest', async (t) => {
        const empty = nil<number>()
        const value = compose(listCons<number>(4), listCons<number>(3), listCons<number>(2), listCons<number>(1))(empty)

        const result1 = $case([[[_], (a) => listHead(a)]])(formList(value))

        const result2 = $case([[[_, _], (a, b) => `${a} ${listHead(b)}`]])(formList(value))

        const result3 = $case([[[_, _, _], (a, b, c) => `${a} ${b} ${listHead(c)}`]])(formList(value))

        const result4 = $case([[[_, _, _, _], (a, b, c, d) => `${a} ${b} ${c} ${d}`]])(formList(value))

        const result5 = $case([
            [[], (a) => a],
            [[_, _, _], (a, b) => `${a} - ${b}`],
        ])(formList(value))

        t.equal(result1, 4)
        t.equal(result2, '4 3')
        t.equal(result3, '4 3 2')
        t.equal(result4, '4 3 2 1')
        t.equal(result5, '4 - 3')
    })
})
