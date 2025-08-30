import tap from 'tap'
import { compose, id, dot, Dot } from 'ghc/base/functions'
import { applicative } from 'ghc/base/non-empty/applicative'
import { toList, fromList, NonEmptyBox } from 'ghc/base/non-empty/list'
import { cons, ListBox, nil, toArray as listToArray } from 'ghc/base/list/list'
import type { FunctionArrow } from 'ghc/prim/function-arrow'

const toArray = <T>(x: NonEmptyBox<T>) => compose<NonEmptyBox<T>, ListBox<T>, T[]>(listToArray, toList)(x)

tap.test('NonEmpty applicative', { skip: true }, async (t) => {
    t.test('pure', async (t) => {
        const result = applicative.pure(3)

        t.same(toArray(result), [3])
    })

    t.test('<*>', async (t) => {
        const app1: FunctionArrow<number, number> = (x: number) => x * 2
        const app2: FunctionArrow<number, number> = (x: number) => x + 1
        const applicationList = compose(fromList, cons(app1), cons(app2))(nil())
        const valuesList = compose(fromList, cons<number>(1), cons<number>(2), cons(3))(nil())

        const result = applicative['<*>'](applicationList, valuesList)

        t.same(toArray(result), [2, 4, 6, 2, 3, 4])
    })

    t.test('liftA2', async (t) => {
        const app =
            (x: number) =>
            (y: number): string =>
                `(${x},${y})`

        const list1 = compose(fromList, cons<number>(1), cons(2))(nil())
        const list2 = compose(fromList, cons<number>(3), cons(4))(nil())

        const result = applicative.liftA2(app, list1, list2)

        t.same(toArray(result), ['(1,3)', '(1,4)', '(2,3)', '(2,4)'])
    })

    t.test('*>', async (t) => {
        const list1 = compose(fromList, cons<number>(1), cons(2))(nil())
        const list2 = compose(fromList, cons<number>(3), cons(4))(nil())

        const result = applicative['*>'](list1, list2)

        t.same(toArray(result), [3, 4, 3, 4])
    })

    t.test('<*', async (t) => {
        const list1 = compose(fromList, cons<number>(1), cons(2))(nil())
        const list2 = compose(fromList, cons<number>(3), cons(4))(nil())

        const result = applicative['<*'](list1, list2)

        t.same(toArray(result), [1, 1, 2, 2])
    })

    t.test('<**>', async (t) => {
        const app1: FunctionArrow<number, number> = (x: number) => x * 2
        const app2: FunctionArrow<number, number> = (x: number) => x + 1
        const applicationList = compose(fromList, cons(app1), cons(app2))(nil())

        const list1 = compose(fromList, cons<number>(1), cons(2))(nil())

        const result = applicative['<**>'](list1, applicationList)

        t.same(toArray(result), [2, 2, 4, 3])
    })

    t.test('fmap', async (t) => {
        const app: FunctionArrow<number, number> = (x: number) => x * 2
        const list = compose(fromList, cons<number>(1), cons(2))(nil())

        const result = applicative.fmap(app, list)

        t.same(toArray(result), [2, 4])
    })

    t.test('Applicative first law (Identity): pure id <*> v = v', async (t) => {
        const v = compose(fromList, cons(123))(nil())
        const pureId = applicative.pure<FunctionArrow<number, number>>(id)
        const result = applicative['<*>'](pureId, v)

        t.same(toArray(result), toArray(v))
        t.same(toArray(v), [123])
    })

    t.test('Applicative second law (Homomorphism): pure f <*> pure x = pure (f x)', async (t) => {
        const x = 123
        const f = (x: number) => x + 1
        const left = applicative['<*>'](applicative.pure(f), applicative.pure(x))
        const right = applicative.pure(f(x))

        t.same(toArray(left), toArray(right))
        t.same(toArray(right), [124])
    })

    // ($) :: (a -> b) -> a -> b
    t.test('Applicative third law (Interchange): u <*> pure y = pure ($ y) <*> u', async (t) => {
        const app1: FunctionArrow<number, number> = (x: number) => x * 2
        const app2: FunctionArrow<number, number> = (x: number) => x + 1
        const u = compose(fromList, cons(app1), cons(app2))(nil())
        const y = 123
        const $y = (f: FunctionArrow<number, number>) => f(y)

        const left = applicative['<*>'](u, applicative.pure(y))
        const right = applicative['<*>'](applicative.pure($y), u)

        t.same(toArray(left), toArray(right))
        t.same(toArray(right), [246, 124])
    })

    t.test('Applicative forth law (Composition): pure (.) <*> u <*> v <*> w = u <*> (v <*> w)', async (t) => {
        const pureDot = applicative.pure(dot) as NonEmptyBox<Dot<number, number, number>>

        t.test('no - empty', async (t) => {
            const app1: FunctionArrow<number, number> = (x: number) => x * 2
            const app2: FunctionArrow<number, number> = (x: number) => x + 1
            const app3: FunctionArrow<number, number> = (x: number) => x - 3
            const v = compose(fromList, cons(app1), cons(app2))(nil())
            const u = compose(fromList, cons(app3))(nil())
            const w = compose(fromList, cons<number>(1), cons(2))(nil())

            const right = applicative['<*>'](u, applicative['<*>'](v, w))
            const left = applicative['<*>'](applicative['<*>'](applicative['<*>'](pureDot, u), v), w)

            t.same(toArray(left), toArray(right))
            t.same(toArray(right), [-1, 1, -1, 0])
        })
    })
})
