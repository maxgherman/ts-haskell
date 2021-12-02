import tap from 'tap'
import { compose, Func } from 'ghc/base/functions'
import { $null, cons, head as listHead, List, nil, tail as listTail, toArray } from 'ghc/base/list/list'
import { $case, _, formList, head, map, NonEmpty, nonEmpty, tail, toList } from 'ghc/base/non-empty/list'

tap.test('NonEmpty', async (t) => {
    t.test('nonEmpty', async (t) => {
        const value0 = compose(nonEmpty)(nil<number>())
        const value1 = compose(nonEmpty, cons(1))(nil<number>())
        const value2 = compose(nonEmpty, cons(1), cons(2))(nil<number>())
        const value3 = compose(nonEmpty, cons(1), cons(2), cons(3))(nil<number>())

        t.equal(value0(), undefined)

        t.equal(((value1() as Func)() as never[])[0], 1)
        t.ok($null(((value1() as Func)() as never[])[1] as unknown as List<number>))

        t.equal(((value2() as Func)() as never[])[0], 1)
        t.equal(listHead(((value2() as Func)() as never[])[1] as unknown as List<number>), 2)

        t.equal(((value3() as Func)() as never[])[0], 1)
        t.equal(listHead(((value3() as Func)() as never[])[1] as unknown as List<number>), 2)
        t.equal(listHead(listTail(((value3() as Func)() as never[])[1] as unknown as List<number>)), 3)
    })

    t.test('head', async (t) => {
        const list: NonEmpty<number> = () => [1, nil<number>()]
        const result = head(list)

        t.equal(result, 1)
    })

    t.test('tail', async (t) => {
        const list1: NonEmpty<number> = () => [1, nil<number>()]
        const list2: NonEmpty<number> = () => [1, cons(3)(nil<number>())]

        const result1 = tail(list1)
        const result2 = tail(list2)

        t.same(toArray(result1), [])
        t.same(toArray(result2), [3])
    })

    t.test('fromList', async (t) => {
        const list1 = nil<number>()
        const list2 = cons(2)(cons(3)(nil<number>()))

        const result2 = formList(list2)

        t.throws(() => formList(list1))
        t.equal(((result2 as Func)() as never[])[0], 2)
        t.equal(listHead(((result2 as Func)() as never[])[1] as unknown as List<number>), 3)
        t.ok($null(listTail(((result2 as Func)() as never[])[1] as unknown as List<number>)))
    })

    t.test('toListList', async (t) => {
        const list: NonEmpty<number> = () => [0, compose(cons(1), cons(2), cons(3))(nil<number>())]

        const result = toList(list)

        t.same(toArray(result), [0, 1, 2, 3])
    })

    t.test('map', async (t) => {
        const list: NonEmpty<number> = () => [0, compose(cons(1), cons(2), cons(3))(nil<number>())]

        const result = map((x) => x + 1, list)

        t.same(toArray(toList(result)), [1, 2, 3, 4])
    })

    t.test('$case', async (t) => {
        const value1 = compose(formList, cons(1))(nil<number>())
        const value2 = compose(formList, cons(1), cons(2))(nil<number>())
        const value3 = compose(formList, cons(1), cons(2), cons(3))(nil<number>())

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
        const value = compose(cons(4), cons(3), cons(2), cons(1))(empty)

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
