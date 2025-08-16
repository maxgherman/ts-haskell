import tap from 'tap'
import { monad as createMonad } from 'control/writer/monad'
import { writer, runWriter, WriterBox } from 'control/writer/writer'
import { tuple2, snd, Tuple2Box, UnitBox, unit } from 'ghc/base/tuple/tuple'
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
})

