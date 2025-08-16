import tap from 'tap'
import { applicative as createApplicative } from 'control/writer/applicative'
import { writer, runWriter, WriterBox } from 'control/writer/writer'
import { tuple2, snd, Tuple2Box, UnitBox, unit } from 'ghc/base/tuple/tuple'
import { monoid as createListMonoid } from 'ghc/base/list/monoid'
import { cons, nil, toArray, ListBox } from 'ghc/base/list/list'
import { applicative as listApplicative } from 'ghc/base/list/applicative'
import { $case as maybeCase, just, nothing, MaybeBox } from 'ghc/base/maybe/maybe'
import { applicative as maybeApplicative } from 'ghc/base/maybe/applicative'
import { $case as eitherCase, left, right, EitherBox } from 'data/either/either'
import { applicative as eitherApplicative } from 'data/either/applicative'
import { applicative as tupleApplicative } from 'ghc/base/tuple/tuple2-applicative'
import { monoid as unitMonoid } from 'ghc/base/tuple/unit-monoid'
import { applicative as promiseApplicative } from 'extra/promise/applicaive'
import { PromiseBox } from 'extra/promise/promise'

const createList = <T>(values: NonNullable<T>[]): ListBox<T> =>
    values.reduceRight((acc, curr) => cons(curr)(acc), nil<T>())

const logMonoid = createListMonoid<string>()
const applicative = createApplicative<ListBox<string>>(logMonoid)

const listApp = listApplicative

const run = <A>(w: WriterBox<ListBox<string>, A>) => runWriter(w)

tap.test('Writer applicative', async (t) => {
    t.test('pure', async (t) => {
        const result = applicative.pure(3)
        const [v, l] = run(result)
        t.equal(v, 3)
        t.same(toArray(l as ListBox<string>), [])
    })

    t.test('<*>', async (t) => {
        const wf = writer(() => tuple2((x: number) => x + 1, createList(['f'])))
        const wa = writer(() => tuple2(2, createList(['a'])))
        const result = applicative['<*>'](wf, wa)
        const [v, l] = run(result)
        t.equal(v, 3)
        t.same(toArray(l as ListBox<string>), ['f', 'a'])
    })

    t.test('liftA2', async (t) => {
        const w1 = writer(() => tuple2(2, createList(['a'])))
        const w2 = writer(() => tuple2(3, createList(['b'])))
        const result = applicative.liftA2((x: number) => (y: number) => x + y, w1, w2)
        const [v, l] = run(result)
        t.equal(v, 5)
        t.same(toArray(l as ListBox<string>), ['a', 'b'])
    })

    t.test('*>', async (t) => {
        const w1 = writer(() => tuple2(1, createList(['a'])))
        const w2 = writer(() => tuple2(2, createList(['b'])))
        const result = applicative['*>'](w1, w2)
        const [v, l] = run(result)
        t.equal(v, 2)
        t.same(toArray(l as ListBox<string>), ['a', 'b'])
    })

    t.test('<*', async (t) => {
        const w1 = writer(() => tuple2(1, createList(['a'])))
        const w2 = writer(() => tuple2(2, createList(['b'])))
        const result = applicative['<*'](w1, w2)
        const [v, l] = run(result)
        t.equal(v, 1)
        t.same(toArray(l as ListBox<string>), ['a', 'b'])
    })

    t.test('<**>', async (t) => {
        const wf = writer(() => tuple2((x: number) => x + 1, createList(['f'])))
        const wa = writer(() => tuple2(2, createList(['a'])))
        const result = applicative['<**>'](wa, wf)
        const [v, l] = run(result)
        t.equal(v, 3)
        t.same(toArray(l as ListBox<string>), ['a', 'f'])
    })

    t.test('fmap', async (t) => {
        const w = writer(() => tuple2(2, createList(['a'])))
        const result = applicative.fmap((x: number) => x * 2, w)
        const [v, l] = run(result)
        t.equal(v, 4)
        t.same(toArray(l as ListBox<string>), ['a'])
    })

    t.test('Applicative with Maybe', async (t) => {
        const w1 = writer(() => tuple2(just(3), createList(['a'])))
        const w2 = writer(() => tuple2(just(4), createList(['b'])))
        const w3 = writer(() => tuple2(nothing<number>(), createList(['c'])))
        const result = applicative.liftA2(
            (m1: MaybeBox<number>) =>
            (m2: MaybeBox<number>) =>
                maybeApplicative.liftA2((x: number) => (y: number) => x + y, m1, m2),
            w1,
            w2,
        )
        const result2 = applicative.liftA2(
            (m1: MaybeBox<number>) =>
            (m2: MaybeBox<number>) =>
                maybeApplicative.liftA2((x: number) => (y: number) => x + y, m1, m2),
            w1,
            w3,
        )
        const [v1, l1] = run(result)
        const [v2, l2] = run(result2)
        maybeCase({
            just: (x) => t.equal(x, 7),
            nothing: () => t.fail('expected Just'),
        })(v1 as MaybeBox<number>)
        maybeCase({
            just: () => t.fail('expected Nothing'),
            nothing: () => t.pass(''),
        })(v2 as MaybeBox<number>)
        t.same(toArray(l1 as ListBox<string>), ['a', 'b'])
        t.same(toArray(l2 as ListBox<string>), ['a', 'c'])
    })

    t.test('Applicative with Either', async (t) => {
        const w1 = writer(() => tuple2(right<string, number>(3), createList(['a'])))
        const w2 = writer(() => tuple2(right<string, number>(4), createList(['b'])))
        const w3 = writer(() => tuple2(left<string, number>('err'), createList(['c'])))
        const eitherApp = eitherApplicative<string>()
        const result = applicative.liftA2(
            (e1: EitherBox<string, number>) =>
            (e2: EitherBox<string, number>) =>
                eitherApp.liftA2((x: number) => (y: number) => x + y, e1, e2),
            w1,
            w2,
        )
        const result2 = applicative.liftA2(
            (e1: EitherBox<string, number>) =>
            (e2: EitherBox<string, number>) =>
                eitherApp.liftA2((x: number) => (y: number) => x + y, e1, e2),
            w1,
            w3,
        )
        const [v1, l1] = run(result)
        const [v2, l2] = run(result2)
        eitherCase({
            right: (x) => t.equal(x, 7),
            left: () => t.fail('expected Right'),
        })(v1 as EitherBox<string, number>)
        eitherCase({
            right: () => t.fail('expected Left'),
            left: (e) => t.equal(e, 'err'),
        })(v2 as EitherBox<string, number>)
        t.same(toArray(l1 as ListBox<string>), ['a', 'b'])
        t.same(toArray(l2 as ListBox<string>), ['a', 'c'])
    })

    t.test('Applicative with Tuple', async (t) => {
        const tupleApp = tupleApplicative(unitMonoid)
        const w1 = writer(() => tuple2(tuple2(unit(), 3), createList(['a'])))
        const w2 = writer(() => tuple2(tuple2(unit(), 4), createList(['b'])))
        const result = applicative.liftA2(
            (t1: Tuple2Box<UnitBox, number>) =>
            (t2: Tuple2Box<UnitBox, number>) =>
                tupleApp.liftA2((x: number) => (y: number) => x + y, t1, t2),
            w1,
            w2,
        )
        const [v, l] = run(result)
        t.equal(snd(v as Tuple2Box<UnitBox, number>), 7)
        t.same(toArray(l as ListBox<string>), ['a', 'b'])
    })

    t.test('Applicative with Promise', async (t) => {
        const w1 = writer(() => tuple2(Promise.resolve(3) as PromiseBox<number>, createList(['a'])))
        const w2 = writer(() => tuple2(Promise.resolve(4) as PromiseBox<number>, createList(['b'])))
        const result = applicative.liftA2(
            (p1: PromiseBox<number>) =>
            (p2: PromiseBox<number>) =>
                promiseApplicative.liftA2((x: number) => (y: number) => x + y, p1, p2),
            w1,
            w2,
        )
        const [v, l] = run(result)
        t.equal(await (v as PromiseBox<number>), 7)
        t.same(toArray(l as ListBox<string>), ['a', 'b'])
    })

    t.test('Applicative with List', async (t) => {
        const w1 = writer(() => tuple2(createList([1, 2]), createList(['a'])))
        const w2 = writer(() => tuple2(createList([3, 4]), createList(['b'])))
        const result = applicative.liftA2(
            (l1: ListBox<number>) =>
            (l2: ListBox<number>) =>
                listApp.liftA2((x: number) => (y: number) => x + y, l1, l2),
            w1,
            w2,
        )
        const [v, l] = run(result)
        t.same(toArray(v as ListBox<number>), [4, 5, 5, 6])
        t.same(toArray(l as ListBox<string>), ['a', 'b'])
    })
})

