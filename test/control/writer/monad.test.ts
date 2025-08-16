import tap from 'tap'
import { monad as createMonad } from 'control/writer/monad'
import { writer, runWriter, WriterBox } from 'control/writer/writer'
import { tuple2, snd, Tuple2Box, Tuple2BoxT, UnitBox, unit } from 'ghc/base/tuple/tuple'
import { cons, nil, toArray, ListBox } from 'ghc/base/list/list'
import { monoid as listMonoid } from 'ghc/base/list/monoid'
import { monad as listMonad } from 'ghc/base/list/monad'
import { $case as maybeCase, just, MaybeBox } from 'ghc/base/maybe/maybe'
import { monad as maybeMonad } from 'ghc/base/maybe/monad'
import { $case as eitherCase, right, EitherBox } from 'data/either/either'
import { monad as eitherMonad } from 'data/either/monad'
import { monad as tupleMonad } from 'ghc/base/tuple/tuple2-monad'
import { monoid as unitMonoid } from 'ghc/base/tuple/unit-monoid'
import { PromiseBox } from 'extra/promise/promise'
import { monad as promiseMonad } from 'extra/promise/monad'
import { doNotation } from 'ghc/base/monad/do-notation'

const createList = <T>(values: NonNullable<T>[]): ListBox<T> =>
    values.reduceRight((acc, curr) => cons(curr)(acc), nil<T>())

const logMonoid = listMonoid<string>()
const monad = createMonad<ListBox<string>>(logMonoid)
const run = <A>(w: WriterBox<ListBox<string>, A>) => runWriter(w)

tap.test('Writer monad', async (t) => {
    t.test('return', async (t) => {
        const result = monad.return(3)
        const [v, l] = run(result)
        t.equal(v, 3)
        t.same(toArray(l), [])
    })

    t.test('>>=', async (t) => {
        const w1 = writer(() => tuple2(2, createList(['a'])))
        const f = (x: number) => writer(() => tuple2(x + 1, createList(['b'])))
        const result = monad['>>='](w1, f)
        const [v, l] = run(result)
        t.equal(v, 3)
        t.same(toArray(l), ['a', 'b'])
    })

    t.test('>>', async (t) => {
        const w1 = writer(() => tuple2('x', createList(['a'])))
        const w2 = writer(() => tuple2('y', createList(['b'])))
        const result = monad['>>'](w1, w2)
        const [v, l] = run(result)
        t.equal(v, 'y')
        t.same(toArray(l), ['a', 'b'])
    })

    t.test('Monad with List', async (t) => {
        const listM = listMonad
        const w1 = writer(() => tuple2(createList([1, 2]), createList(['a'])))
        const f = (l: ListBox<number>) =>
            writer(() => tuple2(listM['>>='](l, (x: number) => createList([x, x + 1])), createList(['b'])))
        const result = monad['>>='](w1, f)
        const [v, l] = run(result)
        t.same(toArray(v as ListBox<number>), [1, 2, 2, 3])
        t.same(toArray(l), ['a', 'b'])
    })

    t.test('Monad with Maybe', async (t) => {
        const maybeM = maybeMonad
        const w1 = writer(() => tuple2(just(2), createList(['a'])))
        const f = (m: MaybeBox<number>) =>
            writer(() => tuple2(maybeM['>>='](m, (x: number) => maybeM.pure(x + 1)), createList(['b'])))
        const result = monad['>>='](w1, f)
        const [v, l] = run(result)
        maybeCase({
            nothing: () => t.fail('expected Just'),
            just: (x: number) => t.equal(x, 3),
        })(v as MaybeBox<number>)
        t.same(toArray(l), ['a', 'b'])
    })

    t.test('Monad with Either', async (t) => {
        const eitherM = eitherMonad<string>()
        const w1 = writer(() => tuple2(right<string, number>(2), createList(['a'])))
        const f = (e: EitherBox<string, number>) =>
            writer(() => tuple2(eitherM['>>='](e, (x: number) => eitherM.pure(x + 1)), createList(['b'])))
        const result = monad['>>='](w1, f)
        const [v, l] = run(result)
        eitherCase({
            left: () => t.fail('expected Right'),
            right: (x: number) => t.equal(x, 3),
        })(v as EitherBox<string, number>)
        t.same(toArray(l), ['a', 'b'])
    })

    t.test('Monad with Tuple', async (t) => {
        const tupleM = tupleMonad(unitMonoid)
        const w1 = writer(() => tuple2(tuple2(unit(), 2), createList(['a'])))
        const f = (tp: Tuple2Box<UnitBox, number>) =>
            writer(() => tuple2(tupleM['>>='](tp, (x: number) => tuple2(unit(), x + 1)), createList(['b'])))
        const result = monad['>>='](w1, f)
        const [v, l] = run(result)
        t.equal(snd(v as Tuple2Box<UnitBox, number>), 3)
        t.same(toArray(l), ['a', 'b'])
    })

    t.test('Monad with Promise', async (t) => {
        const w1 = writer(() => tuple2(Promise.resolve(2) as PromiseBox<number>, createList(['a'])))
        const f = (p: PromiseBox<number>) =>
            writer(() =>
                tuple2(
                    promiseMonad['>>='](p, (x: number) => Promise.resolve(x + 1) as PromiseBox<number>),
                    createList(['b']),
                ),
            )
        const result = monad['>>='](w1, f) as WriterBox<ListBox<string>, PromiseBox<number>>
        const [v, l] = run(result)
        t.equal(await v, 3)
        t.same(toArray(l), ['a', 'b'])
    })

    t.test('Monad with List and do-notation', async (t) => {
        const result = doNotation<WriterBox<ListBox<string>, ListBox<number>>>(
            function* (): Generator<
                WriterBox<ListBox<string>, ListBox<number>>,
                ListBox<number>,
                ListBox<number>
            > {
                const list1 = (yield writer(() =>
                    tuple2(createList([1, 2]), createList(['a'])),
                )) as ListBox<number>
                const list2 = (yield writer(() =>
                    tuple2(createList([3, 4]), createList(['b'])),
                )) as ListBox<number>

                return listMonad['>>='](list1, (x: number) =>
                    listMonad['>>='](list2, (y: number) => listMonad.pure(x + y)),
                )
            },
            monad,
        )

        const [v, l] = run(result)
        t.same(toArray(v as ListBox<number>), [4, 5, 5, 6])
        t.same(toArray(l), ['a', 'b'])
    })

    t.test('Monad with Maybe and do-notation', async (t) => {
        const maybeM = maybeMonad
        const result = doNotation<WriterBox<ListBox<string>, MaybeBox<number>>>(
            function* (): Generator<
                WriterBox<ListBox<string>, MaybeBox<number>>,
                MaybeBox<number>,
                MaybeBox<number>
            > {
                const value1 = (yield writer(() =>
                    tuple2(just(2), createList(['a'])),
                )) as MaybeBox<number>
                const value2 = (yield writer(() =>
                    tuple2(just(3), createList(['b'])),
                )) as MaybeBox<number>

                return maybeM['>>='](value1, (x: number) =>
                    maybeM['>>='](value2, (y: number) => maybeM.pure(x + y)),
                )
            },
            monad,
        )

        const [v, l] = run(result)
        maybeCase({
            nothing: () => t.fail('expected Just'),
            just: (x: number) => t.equal(x, 5),
        })(v as MaybeBox<number>)
        t.same(toArray(l), ['a', 'b'])
    })

    t.test('Monad with Either and do-notation', async (t) => {
        const eitherM = eitherMonad<string>()
        const result = doNotation<WriterBox<ListBox<string>, EitherBox<string, number>>>(
            function* (): Generator<
                WriterBox<ListBox<string>, EitherBox<string, number>>,
                EitherBox<string, number>,
                EitherBox<string, number>
            > {
                const value1 = (yield writer(() =>
                    tuple2(right<string, number>(2), createList(['a'])),
                )) as EitherBox<string, number>
                const value2 = (yield writer(() =>
                    tuple2(right<string, number>(3), createList(['b'])),
                )) as EitherBox<string, number>

                return eitherM['>>='](value1, (x: number) =>
                    eitherM['>>='](value2, (y: number) => eitherM.pure(x + y)),
                )
            },
            monad,
        )

        const [v, l] = run(result)
        eitherCase({
            left: () => t.fail('expected Right'),
            right: (x: number) => t.equal(x, 5),
        })(v as EitherBox<string, number>)
        t.same(toArray(l), ['a', 'b'])
    })

    t.test('Monad with Tuple and do-notation', async (t) => {
        const tupleM = tupleMonad(unitMonoid)
        const result = doNotation<WriterBox<ListBox<string>, Tuple2BoxT<UnitBox, number>>>(
            function* (): Generator<
                WriterBox<ListBox<string>, Tuple2BoxT<UnitBox, number>>,
                Tuple2BoxT<UnitBox, number>,
                Tuple2BoxT<UnitBox, number>
            > {
                const tuple1 = (yield writer(() =>
                    tuple2(tuple2(unit(), 2), createList(['a'])),
                )) as Tuple2BoxT<UnitBox, number>
                const tuple2Val = (yield writer(() =>
                    tuple2(tuple2(unit(), 3), createList(['b'])),
                )) as Tuple2BoxT<UnitBox, number>

                return tupleM['>>='](tuple1, (x: number) =>
                    tupleM['>>='](tuple2Val, (y: number) => tupleM.pure(x + y)),
                )
            },
            monad,
        )

        const [v, l] = run(result)
        t.equal(snd(v as Tuple2BoxT<UnitBox, number>), 5)
        t.same(toArray(l), ['a', 'b'])
    })

    t.test('Monad with Promise and do-notation', async (t) => {
        const result = doNotation<WriterBox<ListBox<string>, PromiseBox<number>>>(
            function* (): Generator<
                WriterBox<ListBox<string>, PromiseBox<number>>,
                PromiseBox<number>,
                PromiseBox<number>
            > {
                const p1 = (yield writer(() =>
                    tuple2(Promise.resolve(2) as PromiseBox<number>, createList(['a'])),
                )) as PromiseBox<number>
                const p2 = (yield writer(() =>
                    tuple2(Promise.resolve(3) as PromiseBox<number>, createList(['b'])),
                )) as PromiseBox<number>

                return promiseMonad['>>='](p1, (x: number) =>
                    promiseMonad['>>='](p2, (y: number) => promiseMonad.pure(x + y)),
                )
            },
            monad,
        ) as WriterBox<ListBox<string>, PromiseBox<number>>

        const [v, l] = run(result)
        t.equal(await v, 5)
        t.same(toArray(l), ['a', 'b'])
    })
})

