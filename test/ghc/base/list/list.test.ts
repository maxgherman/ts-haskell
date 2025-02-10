import tap from 'tap'
import { compose, id } from 'ghc/base/functions'
import { $null, concat, cons, head, map, nil, tail, take, repeat, toArray } from 'ghc/base/list/list'
import { $case, _ } from 'ghc/base/list/patterns'

tap.test('List', async (t) => {
    t.test('Nil constructor', async (t) => {
        const value = nil<number>()
        const result = value()

        t.same(result, [])
        t.same(toArray(value), [])
    })

    t.test('Nil $null', async (t) => {
        const value = nil<number>()

        t.ok($null(value))
    })

    t.test('Nil $case', async (t) => {
        const value = nil<string>()

        const result1 = $case([[[], () => 123]])(value)

        const result2 = $case([
            [[], () => 123],
            [[], () => 123],
        ])(value)

        const result3 = $case([
            [[_], id],
            [[_, _], (_, __) => 1],
            [[], () => 123],
        ])(value)

        const result4 = $case([
            [[_], id],
            [[_, _], (_, __) => 1],
        ])

        const result5 = $case([])

        t.equal(result1, 123)
        t.equal(result2, 123)
        t.equal(result3, 123)
        t.throws(() => result4(value))
        t.throws(() => result5(value))
    })

    t.test('Nil head', async (t) => {
        const value = nil<number>()

        t.throws(() => head(value))
    })

    t.test('Nil tail', async (t) => {
        const value = nil<number>()

        t.throws(() => tail(value))
    })

    t.test('Nil map ', async (t) => {
        const value = nil<number>()

        const result = map((x) => x + 1, value)

        t.same(toArray(result), [])
    })

    t.test('Cons constructor', async (t) => {
        const empty = nil<number>()
        const result1 = cons<number>(3)(cons<number>(2)(cons<number>(1)(empty)))
        const result2 = compose(cons<number>(3), cons<number>(2), cons<number>(1))(empty)

        t.same(toArray(result1), [3, 2, 1])
        t.same(toArray(result2), [3, 2, 1])
    })

    t.test('Cons $case', async (t) => {
        const empty = nil<number>()
        const value1 = cons<number>(1)(empty)
        const value2 = cons<number>(2)(cons<number>(1)(empty))
        const value3 = cons<number>(3)(cons<number>(2)(cons<number>(1)(empty)))

        const result1 = $case([
            [[_, _], (a, b) => a + b],
            [[_, _, _], (a, b, c) => a + b + c],
            [[_], (a) => a + 10],
        ])(value1)

        const result2 = $case([
            [[], () => {}],
            [[_, _], (a, b) => a + b + 10],
        ])(value2)

        const result3 = $case([
            [[_, _, _], (a, b, c) => a + b + c],
            [[_], (a) => a + 10],
        ])(value3)

        t.equal(result1, 1 + 10)
        t.equal(result2, 2 + 1 + 10)
        t.equal(result3, 3 + 2 + 1)
    })

    t.test('Cons $case rest', async (t) => {
        const empty = nil<number>()
        const value = compose(cons<number>(4), cons<number>(3), cons<number>(2), cons<number>(1))(empty)

        const result1 = $case([[[_], (a) => head(a)]])(value)

        const result2 = $case([[[_, _], (a, b) => `${a} ${head(b)}`]])(value)

        const result3 = $case([[[_, _, _], (a, b, c) => `${a} ${b} ${head(c)}`]])(value)

        const result4 = $case([[[_, _, _, _], (a, b, c, d) => `${a} ${b} ${c} ${d}`]])(value)

        const result5 = $case([
            [[], (a) => a],
            [[_, _, _], (a, b) => `${a} - ${b}`],
        ])(value)

        t.equal(result1, 4)
        t.equal(result2, '4 3')
        t.equal(result3, '4 3 2')
        t.equal(result4, '4 3 2 1')
        t.equal(result5, '4 - 3')
    })

    t.test('Cons $case rest exact', async (t) => {
        const empty = nil<number>()
        const value1 = cons<number>(1)(empty)
        const value2 = compose(cons<number>(1), cons<number>(2))(empty)
        const value3 = compose(cons<number>(1), cons<number>(2), cons<number>(3))(empty)

        const result1 = $case([[[_], (a, b) => ({ a, b: $null(b) })]])(value1)

        const result2 = $case([[[_, _], (a, b, c) => ({ a, b, c: $null(c) })]])(value2)

        const result3 = $case([[[_, _, _], (a, b, c, d) => ({ a, b, c, d: $null(d) })]])(value3)

        t.same(result1, { a: 1, b: true })
        t.same(result2, { a: 1, b: 2, c: true })
        t.same(result3, { a: 1, b: 2, c: 3, d: true })
    })

    t.test('Cons head', async (t) => {
        const value = compose(cons<number>(2), cons<number>(1))(nil())
        t.equal(head(value), 2)
    })

    t.test('Cons tail', async (t) => {
        const value1 = compose(cons<number>(2), cons<number>(1))(nil())
        t.same(toArray(tail(value1)), [1])
        t.same(toArray(tail(tail(value1))), [])
        t.ok($null(tail(tail(value1))))
    })

    t.test('Cons map ', async (t) => {
        const value = compose(cons<number>(3), cons<number>(2), cons<number>(1))(nil())

        const result = map((x) => x + 1, value)

        t.same(toArray(result), [4, 3, 2])
    })

    t.test('concat ', async (t) => {
        const nill1 = nil<number>()
        const nill2 = nil<number>()
        const cons1 = compose(cons<number>(1))(nil())
        const cons2 = compose(cons<number>(3), cons<number>(2), cons<number>(1))(nil())

        const result1 = concat(nill1, nill2)
        const result2 = concat(nill1, cons1)
        const result3 = concat(cons1, nill1)
        const result4 = concat(cons1, cons2)
        const result5 = concat(cons2, cons1)

        t.ok($null(result1))
        t.same(toArray(result2), [1])
        t.same(toArray(result3), [1])
        t.same(toArray(result4), [1, 3, 2, 1])
        t.same(toArray(result5), [3, 2, 1, 1])
    })

    t.test('take', async (t) => {
        const nill = nil<number>()
        const cons1 = compose(cons<number>(1))(nil())
        const cons2 = compose(cons<number>(3), cons<number>(2), cons<number>(1))(nil())

        t.same(toArray(take(3, nill)), [])
        t.same(toArray(take(5, cons1)), [1])
        t.same(toArray(take(3, cons2)), [3, 2, 1])
    })

    t.test('repeat', async (t) => {
        const list = repeat(3)

        t.same(toArray(take(5, list)), [3, 3, 3, 3, 3])
    })
})
