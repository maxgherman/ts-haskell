import tap from 'tap'
import { monad as maybeMonad } from 'ghc/base/maybe/monad'
import { just, $case, MaybeBox } from 'ghc/base/maybe/maybe'
import { monoid as listMonoid } from 'ghc/base/list/monoid'
import { ListBox, cons, nil, toArray } from 'ghc/base/list/list'
import { functor as writerTFunctor } from 'control/monad/trans/writer/functor'
import { applicative as writerTApplicative } from 'control/monad/trans/writer/applicative'
import { monad as writerTMonad } from 'control/monad/trans/writer/monad'
import {
    writerT as mkWriterT,
    WriterTBox,
    lift as liftLocal,
    runWriterT as runWriterTHelper,
    tuple as tupleAlias,
} from 'control/monad/trans/writer/writer-t'
import { writerT as writerTTrans } from 'control/monad/trans/monad-trans'
import { tuple2 } from 'ghc/base/tuple/tuple'

const maybeM = maybeMonad
const logsMonoid = listMonoid<string>()

const run = <W, A>(wa: WriterTBox<W, A>): MaybeBox<[A, W]> => wa.runWriterT() as MaybeBox<[A, W]>
const fromMaybe = <A>(ma: MaybeBox<A>): A => $case<A, A>({ just: (x) => x })(ma)

tap.test('WriterT Functor laws', async (t) => {
    const writerFunctor = writerTFunctor<ListBox<string>>(maybeM)
    const writerThreeA = mkWriterT<ListBox<string>, number>(() => just(tuple2(3, cons<string>('a')(nil<string>()))))
    const identity = (n: number) => n
    t.same(fromMaybe(run(writerFunctor.fmap(identity, writerThreeA))), fromMaybe(run(writerThreeA)))
})

tap.test('WriterT Applicative combine logs', async (t) => {
    const writerApplicative = writerTApplicative<ListBox<string>>(maybeM, logsMonoid)
    const writerFunction = mkWriterT<ListBox<string>, (x: number) => number>(() =>
        just(tuple2((n: number) => n + 1, cons<string>('f')(nil<string>()))),
    )
    const writerArgA = mkWriterT<ListBox<string>, number>(() => just(tuple2(10, cons<string>('a')(nil<string>()))))

    const applied = writerApplicative['<*>'](writerFunction, writerArgA)
    const [value1, logs1] = fromMaybe(run(applied))
    t.equal(value1, 11)
    t.same(toArray(logs1), ['f', 'a'])
})

tap.test('WriterT Applicative liftA2 combine logs', async (t) => {
    const writerApplicative2 = writerTApplicative<ListBox<string>>(maybeM, logsMonoid)
    const writerA = mkWriterT<ListBox<string>, number>(() => just(tuple2(2, cons<string>('a')(nil<string>()))))
    const writerB = mkWriterT<ListBox<string>, number>(() => just(tuple2(3, cons<string>('b')(nil<string>()))))

    const combined = writerApplicative2.liftA2((x: number) => (y: number) => x * y, writerA, writerB)
    const [value2, logs2] = fromMaybe(run(combined))
    t.equal(value2, 6)
    t.same(toArray(logs2), ['a', 'b'])
})

tap.test('WriterT local lift function', async (t) => {
    const lifted = liftLocal<ListBox<string>, number>(maybeM, logsMonoid, just(77))
    const [value3, logs3] = fromMaybe(run(lifted))
    t.equal(value3, 77)
    t.same(toArray(logs3), [])
})

tap.test('WriterT run helper', async (t) => {
    const writerSample = mkWriterT<ListBox<string>, number>(() => just(tuple2(5, cons<string>('x')(nil<string>()))))
    const [v, logs] = fromMaybe(runWriterTHelper(writerSample) as MaybeBox<[number, ListBox<string>]>)
    t.equal(v, 5)
    t.same(toArray(logs), ['x'])
})

tap.test('WriterT tuple alias coverage', async (t) => {
    const tp = tupleAlias(1, cons<string>('t')(nil<string>()))
    t.same(tp[0], 1)
    t.same(toArray(tp[1] as ListBox<string>), ['t'])
})

tap.test('WriterT kind function', async (t) => {
    const writerForKind = mkWriterT<ListBox<string>, number>(() => just(tuple2(1, cons<string>('k')(nil<string>()))))
    const kindFn = (writerForKind as unknown as { kind: (_: unknown) => (_: unknown) => string }).kind
    const kindValue = kindFn('*')('*')
    t.equal(kindValue, '*')
})

tap.test('WriterT Monad laws and lift', async (t) => {
    const writerMonad = writerTMonad<ListBox<string>>(maybeM, logsMonoid)
    const writerTransformer = writerTTrans<ListBox<string>>(maybeM, logsMonoid)
    const returnWriter = (a: number) => writerMonad.return(a)
    const baseWriter = mkWriterT<ListBox<string>, number>(() => just(tuple2(5, cons('x')(nil()))))
    const incrementWriter = (x: number) =>
        mkWriterT<ListBox<string>, number>(() => just(tuple2(x + 1, cons('f')(nil()))))
    const doubleWriter = (x: number) => mkWriterT<ListBox<string>, number>(() => just(tuple2(x * 2, cons('g')(nil()))))

    // Left identity
    {
        const [lv, ll] = fromMaybe(run(writerMonad['>>='](returnWriter(2), incrementWriter)))
        const [rv, rl] = fromMaybe(run(incrementWriter(2)))
        t.equal(lv, rv)
        t.same(toArray(ll as ListBox<string>), toArray(rl as ListBox<string>))
    }

    // Right identity
    {
        const [lv, ll] = fromMaybe(run(writerMonad['>>='](baseWriter, writerMonad.return)))
        const [rv, rl] = fromMaybe(run(baseWriter))
        t.equal(lv, rv)
        t.same(toArray(ll as ListBox<string>), toArray(rl as ListBox<string>))
    }

    // Associativity
    {
        const [lv, ll] = fromMaybe(
            run(writerMonad['>>='](writerMonad['>>='](baseWriter, incrementWriter), doubleWriter)),
        )
        const [rv, rl] = fromMaybe(
            run(writerMonad['>>='](baseWriter, (x: number) => writerMonad['>>='](incrementWriter(x), doubleWriter))),
        )
        t.equal(lv, rv)
        t.same(toArray(ll as ListBox<string>), toArray(rl as ListBox<string>))
    }

    // lift wraps mempty
    const lifted = writerTransformer.lift(just(9))
    const [liftedValue, liftedLogs] = fromMaybe(run(lifted))
    t.equal(liftedValue, 9)
    t.same(toArray(liftedLogs), [])
})

tap.test('WriterT practical usage: logging', async (t) => {
    const writerMonad2 = writerTMonad<ListBox<string>>(maybeM, logsMonoid)
    const log = (msg: string) =>
        mkWriterT<ListBox<string>, []>(() => just(tuple2([], cons<string>(msg)(nil<string>()))))
    const pureNumber = (a: number) => writerMonad2.return(a)

    const program = writerMonad2['>>='](log('start'), () =>
        writerMonad2['>>='](pureNumber(1), (n: number) => writerMonad2['>>='](log('inc'), () => pureNumber(n + 1))),
    )

    const [resultValue, resultLogs] = fromMaybe(run(program))
    t.equal(resultValue, 2)
    t.same(toArray(resultLogs), ['start', 'inc'])
})
