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

const M = maybeMonad
const W = listMonoid<string>()

const run = <W, A>(wa: WriterTBox<W, A>): MaybeBox<[A, W]> => wa.runWriterT() as MaybeBox<[A, W]>
const fromMaybe = <A>(ma: MaybeBox<A>): A => $case<A, A>({ just: (x) => x })(ma)

tap.test('WriterT Functor laws', async (t) => {
    const F = writerTFunctor<ListBox<string>>(M)
    const x = mkWriterT<ListBox<string>, number>(() => just(tuple2(3, cons<string>('a')(nil<string>()))))
    const id = (n: number) => n
    t.same(fromMaybe(run(F.fmap(id, x))), fromMaybe(run(x)))
})

tap.test('WriterT Applicative combine logs', async (t) => {
    const A = writerTApplicative<ListBox<string>>(M, W)
    const wf = mkWriterT<ListBox<string>, (x: number) => number>(() =>
        just(tuple2((n: number) => n + 1, cons<string>('f')(nil<string>()))),
    )
    const wa = mkWriterT<ListBox<string>, number>(() => just(tuple2(10, cons<string>('a')(nil<string>()))))

    const applied = A['<*>'](wf, wa)
    const [v, logs] = fromMaybe(run(applied))
    t.equal(v, 11)
    t.same(toArray(logs), ['f', 'a'])
})

tap.test('WriterT Applicative liftA2 combine logs', async (t) => {
    const A = writerTApplicative<ListBox<string>>(M, W)
    const wa = mkWriterT<ListBox<string>, number>(() => just(tuple2(2, cons<string>('a')(nil<string>()))))
    const wb = mkWriterT<ListBox<string>, number>(() => just(tuple2(3, cons<string>('b')(nil<string>()))))

    const combined = A.liftA2((x: number) => (y: number) => x * y, wa, wb)
    const [v, logs] = fromMaybe(run(combined))
    t.equal(v, 6)
    t.same(toArray(logs), ['a', 'b'])
})

tap.test('WriterT local lift function', async (t) => {
    const lifted = liftLocal<ListBox<string>, number>(M, W, just(77))
    const [v, logs] = fromMaybe(run(lifted))
    t.equal(v, 77)
    t.same(toArray(logs), [])
})

tap.test('WriterT run helper', async (t) => {
    const w = mkWriterT<ListBox<string>, number>(() => just(tuple2(5, cons<string>('x')(nil<string>()))))
    const [v, logs] = fromMaybe(runWriterTHelper(w) as MaybeBox<[number, ListBox<string>]>)
    t.equal(v, 5)
    t.same(toArray(logs), ['x'])
})

tap.test('WriterT tuple alias coverage', async (t) => {
    const tp = tupleAlias(1, cons<string>('t')(nil<string>()))
    t.same(tp[0], 1)
    t.same(toArray(tp[1] as ListBox<string>), ['t'])
})

tap.test('WriterT kind function', async (t) => {
    const x = mkWriterT<ListBox<string>, number>(() => just(tuple2(1, cons<string>('k')(nil<string>()))))
    const kindFn = (x as unknown as { kind: (_: unknown) => (_: unknown) => string }).kind
    const k = kindFn('*')('*')
    t.equal(k, '*')
})

tap.test('WriterT Monad laws and lift', async (t) => {
    const Wm = writerTMonad<ListBox<string>>(M, W)
    const T = writerTTrans<ListBox<string>>(M, W)
    const ret = (a: number) => Wm.return(a)
    const m = mkWriterT<ListBox<string>, number>(() => just(tuple2(5, cons('x')(nil()))))
    const f = (x: number) => mkWriterT<ListBox<string>, number>(() => just(tuple2(x + 1, cons('f')(nil()))))
    const g = (x: number) => mkWriterT<ListBox<string>, number>(() => just(tuple2(x * 2, cons('g')(nil()))))

    // Left identity
    {
        const [lv, ll] = fromMaybe(run(Wm['>>='](ret(2), f)))
        const [rv, rl] = fromMaybe(run(f(2)))
        t.equal(lv, rv)
        t.same(toArray(ll as ListBox<string>), toArray(rl as ListBox<string>))
    }

    // Right identity
    {
        const [lv, ll] = fromMaybe(run(Wm['>>='](m, Wm.return)))
        const [rv, rl] = fromMaybe(run(m))
        t.equal(lv, rv)
        t.same(toArray(ll as ListBox<string>), toArray(rl as ListBox<string>))
    }

    // Associativity
    {
        const [lv, ll] = fromMaybe(run(Wm['>>='](Wm['>>='](m, f), g)))
        const [rv, rl] = fromMaybe(run(Wm['>>='](m, (x: number) => Wm['>>='](f(x), g))))
        t.equal(lv, rv)
        t.same(toArray(ll as ListBox<string>), toArray(rl as ListBox<string>))
    }

    // lift wraps mempty
    const lifted = T.lift(just(9))
    const [v, logs] = fromMaybe(run(lifted))
    t.equal(v, 9)
    t.same(toArray(logs), [])
})

tap.test('WriterT practical usage: logging', async (t) => {
    const Wm = writerTMonad<ListBox<string>>(M, W)
    const log = (msg: string) =>
        mkWriterT<ListBox<string>, []>(() => just(tuple2([], cons<string>(msg)(nil<string>()))))
    const pureN = (a: number) => Wm.return(a)

    const program = Wm['>>='](log('start'), () =>
        Wm['>>='](pureN(1), (n: number) => Wm['>>='](log('inc'), () => pureN(n + 1))),
    )

    const [v, logs] = fromMaybe(run(program))
    t.equal(v, 2)
    t.same(toArray(logs), ['start', 'inc'])
})
