import tap from 'tap'
import { compose, id, dot, Dot } from 'ghc/base/functions'
import { applicative as createApplicative } from 'ghc/base/tuple/tuple2-applicative'
import { tuple2, fst, snd } from 'ghc/base/tuple/tuple'
import { toArray } from 'ghc/base/list/list'
import { monoid as listMonoid } from 'ghc/base/list/monoid'
import { monoid as promiseMonoid } from 'extra/promise/monoid'
import type { FunctionArrow } from 'ghc/prim/function-arrow'
import { PromiseBox } from 'extra/promise/promise'
import { ListBox, cons, nil } from 'ghc/base/list/list'

const baseMonoid = listMonoid<string>()
const innerMonoid = promiseMonoid(baseMonoid)
const applicative = createApplicative(innerMonoid)

tap.test('Tuple2 applicative', async (t) => {
    t.test('pure', async (t) => {
        const result = applicative.pure(3)
        const first = await (fst(result) as PromiseBox<ListBox<string>>)
        const second = snd(result)

        t.same(toArray(first), [])
        t.equal(second, 3)
    })

    t.test('<*>', async (t) => {
        const app: FunctionArrow<number, number> = (x: number) => x * 2
        const f = tuple2(
            Promise.resolve(compose(cons<string>('1'), cons<string>('2'), cons('3'))(nil())) as PromiseBox<ListBox<string>>,
            app,
        )
        const fa = tuple2(
            Promise.resolve(compose(cons<string>('4'), cons<string>('5'), cons('6'))(nil())) as PromiseBox<ListBox<string>>,
            11,
        )

        const result = applicative['<*>'](f, fa)

        const first = await (fst(result) as PromiseBox<ListBox<string>>)
        const second = snd(result)

        t.same(toArray(first), ['1', '2', '3', '4', '5', '6'])
        t.equal(second, 22)
    })

    t.test('liftA2', async (t) => {
        const app =
            (x: number) =>
            (y: number): string =>
                `(${x},${y})`

        const fa = tuple2(Promise.resolve(compose(cons('1'), cons('1'))(nil())) as PromiseBox<ListBox<string>>, 11)
        const fb = tuple2(Promise.resolve(compose(cons('2'), cons('2'))(nil())) as PromiseBox<ListBox<string>>, 12)

        const result = applicative.liftA2(app, fa, fb)

        const first = await (fst(result) as PromiseBox<ListBox<string>>)
        const second = snd(result)

        t.same(toArray(first), ['1', '1', '2', '2'])
        t.equal(second, '(11,12)')
    })

    t.test('*>', async (t) => {
        const fa = tuple2(Promise.resolve(compose(cons('1'), cons('1'))(nil())) as PromiseBox<ListBox<string>>, 11)
        const fb = tuple2(Promise.resolve(compose(cons('2'), cons('2'))(nil())) as PromiseBox<ListBox<string>>, 12)

        const result = applicative['*>'](fa, fb)

        const first = await (fst(result) as PromiseBox<ListBox<string>>)
        const second = snd(result)

        t.same(toArray(first), ['1', '1', '2', '2'])
        t.equal(second, 12)
    })

    t.test('<*', async (t) => {
        const fa = tuple2(Promise.resolve(compose(cons('1'), cons('1'))(nil())) as PromiseBox<ListBox<string>>, 11)
        const fb = tuple2(Promise.resolve(compose(cons('2'), cons('2'))(nil())) as PromiseBox<ListBox<string>>, 12)

        const result = applicative['<*'](fa, fb)

        const first = await (fst(result) as PromiseBox<ListBox<string>>)
        const second = snd(result)

        t.same(toArray(first), ['1', '1', '2', '2'])
        t.equal(second, 11)
    })

    t.test('<**>', async (t) => {
        const fa = tuple2(Promise.resolve(compose(cons<string>('1'), cons('2'))(nil())) as PromiseBox<ListBox<string>>, 11)
        const app: FunctionArrow<number, number> = (x: number) => x * 3
        const f = tuple2(Promise.resolve(compose(cons('3'))(nil())) as PromiseBox<ListBox<string>>, app)

        const result = applicative['<**>'](fa, f)

        const first = await (fst(result) as PromiseBox<ListBox<string>>)
        const second = snd(result)

        t.same(toArray(first), ['1', '2', '3'])
        t.equal(second, 33)
    })

    t.test('fmap', async (t) => {
        const app: FunctionArrow<number, number> = (x: number) => x * 2
        const fa = tuple2(Promise.resolve(compose(cons<string>('1'), cons('2'))(nil())) as PromiseBox<ListBox<string>>, 11)

        const result = applicative.fmap(app, fa)

        const first = await (fst(result) as PromiseBox<ListBox<string>>)
        const second = snd(result)

        t.same(toArray(first), ['1', '2'])
        t.equal(second, 22)
    })

    t.test('Applicative first law (Identity): pure id <*> v = v', async (t) => {
        const v = tuple2(Promise.resolve(compose(cons('123'))(nil())) as PromiseBox<ListBox<string>>, 123)

        const pureId = applicative.pure<FunctionArrow<number, number>>(id)
        const result = applicative['<*>'](pureId, v)

        const first = await (fst(result) as PromiseBox<ListBox<string>>)
        const second = snd(result)

        t.same(toArray(first), ['123'])
        t.equal(second, 123)

        t.same(toArray(await (fst(v) as PromiseBox<ListBox<string>>)), ['123'])
        t.equal(snd(v), 123)
    })

    t.test('Applicative second law (Homomorphism): pure f <*> pure x = pure (f x)', async (t) => {
        const x = 123
        const f = (x: number) => x + 1
        const left = applicative['<*>'](applicative.pure(f), applicative.pure(x))
        const right = applicative.pure(f(x))

        const firstLeft = await (fst(left) as PromiseBox<ListBox<string>>)
        const secondLeft = snd(left)

        const firstRight = await (fst(right) as PromiseBox<ListBox<string>>)
        const secondRight = snd(right)

        t.same(toArray(firstLeft), [])
        t.equal(secondLeft, 124)

        t.same(toArray(firstRight), [])
        t.equal(secondRight, 124)
    })

    // ($) :: (a -> b) -> a -> b
    t.test('Applicative third law (Interchange): u <*> pure y = pure ($ y) <*> u', async (t) => {
        const app1: FunctionArrow<number, number> = (x: number) => x * 2
        const u = tuple2(Promise.resolve(compose(cons<string>('1'), cons('2'))(nil())) as PromiseBox<ListBox<string>>, app1)

        const y = 123
        const $y = (f: FunctionArrow<number, number>) => f(y)

        const left = applicative['<*>'](u, applicative.pure(y))
        const right = applicative['<*>'](applicative.pure($y), u)

        const firstLeft = await (fst(left) as PromiseBox<ListBox<string>>)
        const secondLeft = snd(left)

        const firstRight = await (fst(right) as PromiseBox<ListBox<string>>)
        const secondRight = snd(right)

        t.same(toArray(firstLeft), ['1', '2'])
        t.equal(secondLeft, 246)

        t.same(toArray(firstRight), ['1', '2'])
        t.equal(secondRight, 246)
    })

    t.test('Applicative forth law (Composition): pure (.) <*> u <*> v <*> w = u <*> (v <*> w)', async (t) => {
        const pureDot = applicative.pure(dot as Dot<number, number, number>)

        const app1: FunctionArrow<number, number> = (x: number) => x * 2
        const app3: FunctionArrow<number, number> = (x: number) => x - 3
        const v = tuple2(Promise.resolve(compose(cons<string>('1'), cons('2'))(nil())) as PromiseBox<ListBox<string>>, app1)
        const u = tuple2(Promise.resolve(compose(cons<string>('3'), cons('4'))(nil())) as PromiseBox<ListBox<string>>, app3)
        const w = tuple2(Promise.resolve(compose(cons<string>('5'), cons('6'))(nil())) as PromiseBox<ListBox<string>>, 7)

        const right = applicative['<*>'](u, applicative['<*>'](v, w))
        const left = applicative['<*>'](applicative['<*>'](applicative['<*>'](pureDot, u), v), w)

        const firstLeft = await (fst(left) as PromiseBox<ListBox<string>>)
        const secondLeft = snd(left)

        const firstRight = await (fst(right) as PromiseBox<ListBox<string>>)
        const secondRight = snd(right)

        t.same(toArray(firstLeft), ['3', '4', '1', '2', '5', '6'])
        t.equal(secondLeft, 11)

        t.same(toArray(firstRight), ['3', '4', '1', '2', '5', '6'])
        t.equal(secondRight, 11)
    })
})
