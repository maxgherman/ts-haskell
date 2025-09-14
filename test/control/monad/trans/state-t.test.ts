import tap from 'tap'
import { monad as maybeMonad } from 'ghc/base/maybe/monad'
import { just, $case, MaybeBox } from 'ghc/base/maybe/maybe'
import { functor as stateTFunctor } from 'control/monad/trans/state/functor'
import { applicative as stateTApplicative } from 'control/monad/trans/state/applicative'
import { monad as stateTMonad } from 'control/monad/trans/state/monad'
import {
    stateT as mkStateT,
    StateTBox,
    lift as liftLocal,
    runStateT as runStateTHelper,
    tuple as tupleAlias,
} from 'control/monad/trans/state/state-t'
import { stateT as stateTTrans } from 'control/monad/trans/monad-trans'
import { tuple2 } from 'ghc/base/tuple/tuple'

const M = maybeMonad

const run = <S, A>(sa: StateTBox<S, A>, s: S): MaybeBox<[A, S]> => sa.runStateT(s) as MaybeBox<[A, S]>
const fromMaybe = <A>(ma: MaybeBox<A>): A => $case<A, A>({ just: (x) => x })(ma)

tap.test('StateT Functor identity', async (t) => {
    const F = stateTFunctor<number>(M)
    const x = mkStateT<number, number>((s) => just(tuple2(s + 1, s)))
    const id = (n: number) => n
    t.same(fromMaybe(run(F.fmap(id, x), 3)), fromMaybe(run(x, 3)))
})

tap.test('StateT Applicative apply sequencing', async (t) => {
    const A = stateTApplicative<number>(M)
    const sf = mkStateT<number, (x: number) => number>((s) => just(tuple2((n: number) => n + s, s + 1)))
    const sa = mkStateT<number, number>((s) => just(tuple2(s * 2, s + 2)))

    const [v, s] = fromMaybe(run(A['<*>'](sf, sa), 1))
    // Standard State applicative sequences state: f uses s, a uses s' from f
    t.equal(v, 5)
    t.equal(s, 1 + 1 + 2)
})

tap.test('StateT Applicative liftA2 sequencing', async (t) => {
    const A = stateTApplicative<number>(M)
    const sa = mkStateT<number, number>((s) => just(tuple2(s + 2, s + 1)))
    const sb = mkStateT<number, number>((s) => just(tuple2(s * 3, s + 2)))

    const r = fromMaybe(
        run(
            A.liftA2((a: number) => (b: number) => a + b, sa, sb),
            2,
        ),
    )
    const [v, s] = r
    // sa at s=2 => (4, 3), then sb at s=3 => (9, 5), sum = 13
    t.equal(v, 13)
    t.equal(s, 5)
})

tap.test('StateT local lift function', async (t) => {
    const lifted = liftLocal<number, number>(M, just(42))
    const [v, s] = fromMaybe(run(lifted, 7))
    t.equal(v, 42)
    t.equal(s, 7)
})

tap.test('StateT run helper', async (t) => {
    const sa = mkStateT<number, number>((s) => just(tuple2(s + 10, s + 1)))
    const [v, s] = fromMaybe(runStateTHelper(sa, 5) as MaybeBox<[number, number]>)
    t.equal(v, 15)
    t.equal(s, 6)
})

tap.test('StateT tuple alias coverage', async (t) => {
    const tp = tupleAlias(2, 7)
    t.equal(tp[0], 2)
    t.equal(tp[1], 7)
})

tap.test('StateT kind function', async (t) => {
    const x = mkStateT<number, number>((s) => just(tuple2(s, s)))
    const kindFn = (x as unknown as { kind: (_: unknown) => (_: unknown) => string }).kind
    const k = kindFn('*')('*')
    t.equal(k, '*')
})

tap.test('StateT Monad laws and lift', async (t) => {
    const S = stateTMonad<number>(M)
    const T = stateTTrans<number>(M)
    const ret = (a: number) => S.return(a)
    const m = mkStateT<number, number>((s) => just(tuple2(s + 1, s + 1)))
    const f = (x: number) => mkStateT<number, number>((s) => just(tuple2(x + s, s + 1)))
    const g = (x: number) => mkStateT<number, number>((s) => just(tuple2(x * 2, s + 1)))

    // Left identity
    t.same(fromMaybe(run(S['>>='](ret(2), f), 0)), fromMaybe(run(f(2), 0)))

    // Right identity
    t.same(fromMaybe(run(S['>>='](m, S.return), 0)), fromMaybe(run(m, 0)))

    // Associativity
    t.same(
        fromMaybe(run(S['>>='](S['>>='](m, f), g), 0)),
        fromMaybe(
            run(
                S['>>='](m, (x: number) => S['>>='](f(x), g)),
                0,
            ),
        ),
    )

    // lift
    const lifted = T.lift(just(5))
    t.same(fromMaybe(run(lifted, 3)), [5, 3])
})

tap.test('StateT practical usage: counter', async (t) => {
    const S = stateTMonad<number>(M)
    const get = mkStateT<number, number>((s) => just(tuple2(s, s)))
    const put = (s: number) => mkStateT<number, []>(() => just(tuple2([], s)))

    const program = S['>>='](get, (n: number) => S['>>='](put(n + 1), () => S.return(n)))
    const [v, s] = fromMaybe(run(program, 10))
    t.equal(v, 10)
    t.equal(s, 11)
})
