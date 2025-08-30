import tap from 'tap'
import { writer, runWriter, WriterMinBox } from 'control/writer/writer'
import { semigroup as createWriterSemigroup } from 'control/writer/semigroup'
import { semigroup as createListSemigroup } from 'ghc/base/list/semigroup'
import { cons, nil, ListBox, toArray } from 'ghc/base/list/list'
import { formList } from 'ghc/base/non-empty/list'
import { tuple2 } from 'ghc/base/tuple/tuple'
import { semigroup as createMaybeSemigroup } from 'ghc/base/maybe/semigroup'
import { $case as maybeCase, just, nothing, MaybeBox } from 'ghc/base/maybe/maybe'
import { semigroup as createEitherSemigroup } from 'data/either/semigroup'
import { $case as eitherCase, left, right, EitherBox } from 'data/either/either'
import { semigroup as createTupleSemigroup } from 'ghc/base/tuple/tuple2-semigroup'
import { fst, snd, TupleMinBox } from 'ghc/base/tuple/tuple'
import { semigroup as createPromiseSemigroup } from 'extra/promise/semigroup'
import { PromiseBox } from 'extra/promise/promise'

const createList = <T>(values: NonNullable<T>[]): ListBox<T> =>
    values.reduceRight((acc, curr) => cons(curr)(acc), nil<T>())

const valueSemigroup = createListSemigroup<number>()
const logSemigroup = createListSemigroup<string>()
const semigroup = createWriterSemigroup<ListBox<string>, ListBox<number>>(logSemigroup, valueSemigroup)

const createWriter = (values: number[], logs: string[]): WriterMinBox<ListBox<string>, ListBox<number>> =>
    writer(() => tuple2(createList(values), createList(logs))) as WriterMinBox<ListBox<string>, ListBox<number>>

tap.test('WriterSemigroup', async (t) => {
    t.test('<>', async (t) => {
        const w1 = createWriter([1, 2], ['a'])
        const w2 = createWriter([3], ['b', 'c'])
        const result = semigroup['<>'](w1, w2) as WriterMinBox<ListBox<string>, ListBox<number>>
        const [v, l] = runWriter(result)
        t.same(toArray(v as ListBox<number>), [1, 2, 3])
        t.same(toArray(l as ListBox<string>), ['a', 'b', 'c'])
    })

    t.test('sconcat', async (t) => {
        const w1 = createWriter([1], ['a'])
        const w2 = createWriter([2], ['b'])
        const w3 = createWriter([3], ['c'])
        const list = formList(createList([w1, w2, w3]))
        const result = semigroup.sconcat(list) as WriterMinBox<ListBox<string>, ListBox<number>>
        const [v, l] = runWriter(result)
        t.same(toArray(v as ListBox<number>), [1, 2, 3])
        t.same(toArray(l as ListBox<string>), ['a', 'b', 'c'])
    })

    t.test('stimes', async (t) => {
        const w = createWriter([1], ['a'])
        const thrice = semigroup.stimes(3, w) as WriterMinBox<ListBox<string>, ListBox<number>>
        const [v1, l1] = runWriter(thrice)
        t.same(toArray(v1 as ListBox<number>), [1, 1, 1])
        t.same(toArray(l1 as ListBox<string>), ['a', 'a', 'a'])

        const zero = semigroup.stimes(0, w) as WriterMinBox<ListBox<string>, ListBox<number>>
        const [v0, l0] = runWriter(zero)
        t.same(toArray(v0 as ListBox<number>), [1])
        t.same(toArray(l0 as ListBox<string>), ['a'])

        t.throws(() => semigroup.stimes(-1, w))
    })

    t.test('semigroup law - associativity: (x <> y) <> z = x <> (y <> z)', async (t) => {
        const w1 = createWriter([1], ['a'])
        const w2 = createWriter([2], ['b'])
        const w3 = createWriter([3], ['c'])
        const left = semigroup['<>'](semigroup['<>'](w1, w2), w3) as WriterMinBox<ListBox<string>, ListBox<number>>
        const right = semigroup['<>'](w1, semigroup['<>'](w2, w3)) as WriterMinBox<ListBox<string>, ListBox<number>>
        const [lv, ll] = runWriter(left)
        const [rv, rl] = runWriter(right)
        t.same(toArray(lv as ListBox<number>), toArray(rv as ListBox<number>))
        t.same(toArray(ll as ListBox<string>), toArray(rl as ListBox<string>))
    })
})

tap.test('WriterSemigroup Maybe', async (t) => {
    const maybeValueSemigroup = createMaybeSemigroup<ListBox<number>>(valueSemigroup)
    const maybeSemigroup = createWriterSemigroup<ListBox<string>, MaybeBox<ListBox<number>>>(
        logSemigroup,
        maybeValueSemigroup,
    )

    const w1 = writer(() => tuple2(just(createList([1])), createList(['a']))) as WriterMinBox<
        ListBox<string>,
        MaybeBox<ListBox<number>>
    >
    const w2 = writer(() => tuple2(nothing<ListBox<number>>(), createList(['b']))) as WriterMinBox<
        ListBox<string>,
        MaybeBox<ListBox<number>>
    >

    const result = maybeSemigroup['<>'](w1, w2) as WriterMinBox<ListBox<string>, MaybeBox<ListBox<number>>>
    const [v, l] = runWriter(result)

    maybeCase({
        nothing: () => t.fail('expected Just'),
        just: (x: ListBox<number>) => t.same(toArray(x), [1]),
    })(v as MaybeBox<ListBox<number>>)

    t.same(toArray(l as ListBox<string>), ['a', 'b'])
})

tap.test('WriterSemigroup Either', async (t) => {
    const eitherValueSemigroup = createEitherSemigroup<Error, string>()
    const eitherSemigroup = createWriterSemigroup<ListBox<string>, EitherBox<Error, string>>(
        logSemigroup,
        eitherValueSemigroup,
    )

    const w1 = writer(() => tuple2(right<Error, string>('ok'), createList(['a']))) as WriterMinBox<
        ListBox<string>,
        EitherBox<Error, string>
    >
    const w2 = writer(() => tuple2(left<Error, string>(new Error('fail')), createList(['b']))) as WriterMinBox<
        ListBox<string>,
        EitherBox<Error, string>
    >

    const result = eitherSemigroup['<>'](w1, w2) as WriterMinBox<ListBox<string>, EitherBox<Error, string>>
    const [v, l] = runWriter(result)

    eitherCase({
        left: () => t.fail('expected Right'),
        right: (x: string) => t.equal(x, 'ok'),
    })(v as EitherBox<Error, string>)

    t.same(toArray(l as ListBox<string>), ['a', 'b'])
})

tap.test('WriterSemigroup Tuple', async (t) => {
    const tupleValueSemigroup = createTupleSemigroup<ListBox<number>, ListBox<number>>(valueSemigroup, valueSemigroup)
    const tupleSemigroup = createWriterSemigroup<ListBox<string>, TupleMinBox<ListBox<number>, ListBox<number>>>(
        logSemigroup,
        tupleValueSemigroup,
    )

    const w1 = writer(() => tuple2(tuple2(createList([1]), createList([2])), createList(['a']))) as WriterMinBox<
        ListBox<string>,
        TupleMinBox<ListBox<number>, ListBox<number>>
    >
    const w2 = writer(() => tuple2(tuple2(createList([3]), createList([4])), createList(['b']))) as WriterMinBox<
        ListBox<string>,
        TupleMinBox<ListBox<number>, ListBox<number>>
    >

    const result = tupleSemigroup['<>'](w1, w2) as WriterMinBox<
        ListBox<string>,
        TupleMinBox<ListBox<number>, ListBox<number>>
    >
    const [v, l] = runWriter(result)

    t.same(toArray(fst(v as TupleMinBox<ListBox<number>, ListBox<number>>) as ListBox<number>), [1, 3])
    t.same(toArray(snd(v as TupleMinBox<ListBox<number>, ListBox<number>>) as ListBox<number>), [2, 4])
    t.same(toArray(l as ListBox<string>), ['a', 'b'])
})

tap.test('WriterSemigroup Promise', async (t) => {
    const promiseValueSemigroup = createPromiseSemigroup<ListBox<number>>(valueSemigroup)
    const promiseSemigroup = createWriterSemigroup<ListBox<string>, PromiseBox<ListBox<number>>>(
        logSemigroup,
        promiseValueSemigroup,
    )

    const createPromiseWriter = (values: number[], logs: string[]) =>
        writer(() =>
            tuple2(Promise.resolve(createList(values)) as PromiseBox<ListBox<number>>, createList(logs)),
        ) as WriterMinBox<ListBox<string>, PromiseBox<ListBox<number>>>

    const w1 = createPromiseWriter([1], ['a'])
    const w2 = createPromiseWriter([2, 3], ['b'])

    const result = promiseSemigroup['<>'](w1, w2) as WriterMinBox<ListBox<string>, PromiseBox<ListBox<number>>>
    const [v, l] = runWriter(result)

    const array = await (v as PromiseBox<ListBox<number>>)
    t.same(toArray(array), [1, 2, 3])
    t.same(toArray(l as ListBox<string>), ['a', 'b'])
})
