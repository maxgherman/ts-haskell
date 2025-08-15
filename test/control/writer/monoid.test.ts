import tap from 'tap'
import { monoid as createWriterMonoid } from 'control/writer/monoid'
import { writer, runWriter, WriterMinBox } from 'control/writer/writer'
import { monoid as createListMonoid } from 'ghc/base/list/monoid'
import { cons, nil, toArray, ListBox, List } from 'ghc/base/list/list'
import { tuple2, fst, snd, TupleMinBox } from 'ghc/base/tuple/tuple'
import { monoid as createMaybeMonoid } from 'ghc/base/maybe/monoid'
import { $case as maybeCase, just, nothing, MaybeBox } from 'ghc/base/maybe/maybe'
import { monoid as createEitherMonoid } from 'data/either/monoid'
import { $case as eitherCase, left, right, EitherBox } from 'data/either/either'
import { monoid as createTupleMonoid } from 'ghc/base/tuple/tuple2-monoid'
import { monoid as createPromiseMonoid } from 'extra/promise/monoid'
import { PromiseBox } from 'extra/promise/promise'

const createList = <T>(values: NonNullable<T>[]): ListBox<T> =>
    values.reduceRight((acc, curr) => cons(curr)(acc), nil<T>())

const valueMonoid = createListMonoid<number>()
const logMonoid = createListMonoid<string>()
const writerMonoid = createWriterMonoid<ListBox<string>, ListBox<number>>(logMonoid, valueMonoid)

const createWriter = (
    values: number[],
    logs: string[],
): WriterMinBox<ListBox<string>, ListBox<number>> =>
    writer(() => tuple2(createList(values), createList(logs))) as WriterMinBox<
        ListBox<string>,
        ListBox<number>
    >

tap.test('WriterMonoid List', async (t) => {
    t.test('mempty', async (t) => {
        const [v, l] = runWriter(writerMonoid.mempty)
        t.same(toArray(v as ListBox<number>), [])
        t.same(toArray(l as ListBox<string>), [])
    })

    t.test('<>', async (t) => {
        const w1 = createWriter([1, 2], ['a'])
        const w2 = createWriter([3], ['b', 'c'])
        const result = writerMonoid['<>'](w1, w2) as WriterMinBox<
            ListBox<string>,
            ListBox<number>
        >
        const [v, l] = runWriter(result)
        t.same(toArray(v as ListBox<number>), [1, 2, 3])
        t.same(toArray(l as ListBox<string>), ['a', 'b', 'c'])
    })

    t.test('mappend', async (t) => {
        const w1 = createWriter([1], ['a'])
        const w2 = createWriter([2], ['b'])
        const result = writerMonoid.mappend(w1, w2) as WriterMinBox<
            ListBox<string>,
            ListBox<number>
        >
        const [v, l] = runWriter(result)
        t.same(toArray(v as ListBox<number>), [1, 2])
        t.same(toArray(l as ListBox<string>), ['a', 'b'])
    })

    t.test('mconcat', async (t) => {
        const w1 = createWriter([1], ['a'])
        const w2 = createWriter([2], ['b'])
        const w3 = createWriter([3], ['c'])
        const list = cons(w1)(
            cons(w2)(
                cons(w3)(
                    nil() as List<WriterMinBox<ListBox<string>, ListBox<number>>>,
                ),
            ),
        )
        const result = writerMonoid.mconcat(list) as WriterMinBox<
            ListBox<string>,
            ListBox<number>
        >
        const [v, l] = runWriter(result)
        t.same(toArray(v as ListBox<number>), [1, 2, 3])
        t.same(toArray(l as ListBox<string>), ['a', 'b', 'c'])
    })

    t.test('Monoid law - associativity', async (t) => {
        const w1 = createWriter([1], ['a'])
        const w2 = createWriter([2], ['b'])
        const w3 = createWriter([3], ['c'])
        const left = writerMonoid['<>'](writerMonoid['<>'](w1, w2), w3) as WriterMinBox<
            ListBox<string>,
            ListBox<number>
        >
        const right = writerMonoid['<>'](w1, writerMonoid['<>'](w2, w3)) as WriterMinBox<
            ListBox<string>,
            ListBox<number>
        >
        const [lv, ll] = runWriter(left)
        const [rv, rl] = runWriter(right)
        t.same(toArray(lv as ListBox<number>), toArray(rv as ListBox<number>))
        t.same(toArray(ll as ListBox<string>), toArray(rl as ListBox<string>))
    })

    t.test('Monoid law - right identity', async (t) => {
        const w = createWriter([1], ['a'])
        const result = writerMonoid['<>'](w, writerMonoid.mempty) as WriterMinBox<
            ListBox<string>,
            ListBox<number>
        >
        const [rv, rl] = runWriter(result)
        const [wv, wl] = runWriter(w)
        t.same(toArray(rv as ListBox<number>), toArray(wv as ListBox<number>))
        t.same(toArray(rl as ListBox<string>), toArray(wl as ListBox<string>))
    })

    t.test('Monoid law - left identity', async (t) => {
        const w = createWriter([1], ['a'])
        const result = writerMonoid['<>'](writerMonoid.mempty, w) as WriterMinBox<
            ListBox<string>,
            ListBox<number>
        >
        const [rv, rl] = runWriter(result)
        const [wv, wl] = runWriter(w)
        t.same(toArray(rv as ListBox<number>), toArray(wv as ListBox<number>))
        t.same(toArray(rl as ListBox<string>), toArray(wl as ListBox<string>))
    })
})

tap.test('WriterMonoid Maybe', async (t) => {
    const maybeValueMonoid = createMaybeMonoid<ListBox<number>>(valueMonoid)
    const maybeWriterMonoid = createWriterMonoid<ListBox<string>, MaybeBox<ListBox<number>>>(
        logMonoid,
        maybeValueMonoid,
    )

    const w1 = writer(() =>
        tuple2(just(createList([1])), createList(['a']))
    ) as WriterMinBox<ListBox<string>, MaybeBox<ListBox<number>>>
    const w2 = writer(() =>
        tuple2(nothing<ListBox<number>>(), createList(['b']))
    ) as WriterMinBox<ListBox<string>, MaybeBox<ListBox<number>>>

    const result = maybeWriterMonoid['<>'](w1, w2) as WriterMinBox<
        ListBox<string>,
        MaybeBox<ListBox<number>>
    >
    const [v, l] = runWriter(result)
    maybeCase({
        nothing: () => t.fail('expected Just'),
        just: (x: ListBox<number>) => t.same(toArray(x), [1]),
    })(v as MaybeBox<ListBox<number>>)
    t.same(toArray(l as ListBox<string>), ['a', 'b'])
})

tap.test('WriterMonoid Either', async (t) => {
    const eitherValueMonoid = createEitherMonoid<ListBox<number>, string>(valueMonoid)
    const eitherWriterMonoid = createWriterMonoid<ListBox<string>, EitherBox<ListBox<number>, string>>(
        logMonoid,
        eitherValueMonoid,
    )

    const w1 = writer(() =>
        tuple2(right<ListBox<number>, string>('ok'), createList(['a']))
    ) as WriterMinBox<ListBox<string>, EitherBox<ListBox<number>, string>>
    const w2 = writer(() =>
        tuple2(left<ListBox<number>, string>(createList([1])), createList(['b']))
    ) as WriterMinBox<ListBox<string>, EitherBox<ListBox<number>, string>>

    const result = eitherWriterMonoid['<>'](w1, w2) as WriterMinBox<
        ListBox<string>,
        EitherBox<ListBox<number>, string>
    >
    const [v, l] = runWriter(result)
    eitherCase({
        left: () => t.fail('expected Right'),
        right: (x: string) => t.equal(x, 'ok'),
    })(v as EitherBox<ListBox<number>, string>)
    t.same(toArray(l as ListBox<string>), ['a', 'b'])
})

tap.test('WriterMonoid Tuple', async (t) => {
    const tupleValueMonoid = createTupleMonoid<ListBox<number>, ListBox<number>>(valueMonoid, valueMonoid)
    const tupleWriterMonoid = createWriterMonoid<
        ListBox<string>,
        TupleMinBox<ListBox<number>, ListBox<number>>
    >(logMonoid, tupleValueMonoid)

    const w1 = writer(() =>
        tuple2(tuple2(createList([1]), createList([2])), createList(['a']))
    ) as WriterMinBox<ListBox<string>, TupleMinBox<ListBox<number>, ListBox<number>>>
    const w2 = writer(() =>
        tuple2(tuple2(createList([3]), createList([4])), createList(['b']))
    ) as WriterMinBox<ListBox<string>, TupleMinBox<ListBox<number>, ListBox<number>>>

    const result = tupleWriterMonoid['<>'](w1, w2) as WriterMinBox<
        ListBox<string>,
        TupleMinBox<ListBox<number>, ListBox<number>>
    >
    const [v, l] = runWriter(result)
    t.same(toArray(fst(v as TupleMinBox<ListBox<number>, ListBox<number>>) as ListBox<number>), [1, 3])
    t.same(toArray(snd(v as TupleMinBox<ListBox<number>, ListBox<number>>) as ListBox<number>), [2, 4])
    t.same(toArray(l as ListBox<string>), ['a', 'b'])
})

tap.test('WriterMonoid Promise', async (t) => {
    const promiseValueMonoid = createPromiseMonoid<ListBox<number>>(valueMonoid)
    const promiseWriterMonoid = createWriterMonoid<ListBox<string>, PromiseBox<ListBox<number>>>(
        logMonoid,
        promiseValueMonoid,
    )

    const createPromiseWriter = (values: number[], logs: string[]) =>
        writer(() =>
            tuple2(
                Promise.resolve(createList(values)) as PromiseBox<ListBox<number>>,
                createList(logs),
            ),
        ) as WriterMinBox<ListBox<string>, PromiseBox<ListBox<number>>>

    const w1 = createPromiseWriter([1], ['a'])
    const w2 = createPromiseWriter([2, 3], ['b'])

    const result = promiseWriterMonoid['<>'](w1, w2) as WriterMinBox<
        ListBox<string>,
        PromiseBox<ListBox<number>>
    >
    const [v, l] = runWriter(result)
    const array = await (v as PromiseBox<ListBox<number>>)
    t.same(toArray(array), [1, 2, 3])
    t.same(toArray(l as ListBox<string>), ['a', 'b'])
})

