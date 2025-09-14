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

const maybeM = maybeMonad

const run = <S, A>(sa: StateTBox<S, A>, s: S): MaybeBox<[A, S]> => sa.runStateT(s) as MaybeBox<[A, S]>
const fromMaybe = <A>(ma: MaybeBox<A>): A => $case<A, A>({ just: (x) => x })(ma)

tap.test('StateT Functor identity', async (t) => {
    const stateFunctor = stateTFunctor<number>(maybeM)
    const plusOneState = mkStateT<number, number>((s) => just(tuple2(s + 1, s)))
    const id = (n: number) => n
    t.same(fromMaybe(run(stateFunctor.fmap(id, plusOneState), 3)), fromMaybe(run(plusOneState, 3)))
})

tap.test('StateT Applicative apply sequencing', async (t) => {
    const stateApplicative = stateTApplicative<number>(maybeM)
    const stateFunction = mkStateT<number, (x: number) => number>((s) => just(tuple2((n: number) => n + s, s + 1)))
    const stateArgument = mkStateT<number, number>((s) => just(tuple2(s * 2, s + 2)))

    const [v, s] = fromMaybe(run(stateApplicative['<*>'](stateFunction, stateArgument), 1))
    // Standard State applicative sequences state: f uses s, a uses s' from f
    t.equal(v, 5)
    t.equal(s, 1 + 1 + 2)
})

tap.test('StateT Applicative liftA2 sequencing', async (t) => {
    const applicative2 = stateTApplicative<number>(maybeM)
    const incTwo = mkStateT<number, number>((s) => just(tuple2(s + 2, s + 1)))
    const timesThree = mkStateT<number, number>((s) => just(tuple2(s * 3, s + 2)))

    const r = fromMaybe(
        run(
            applicative2.liftA2((a: number) => (b: number) => a + b, incTwo, timesThree),
            2,
        ),
    )
    const [v, s] = r
    // sa at s=2 => (4, 3), then sb at s=3 => (9, 5), sum = 13
    t.equal(v, 13)
    t.equal(s, 5)
})

tap.test('StateT local lift function', async (t) => {
    const lifted = liftLocal<number, number>(maybeM, just(42))
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
    const stateMonad = stateTMonad<number>(maybeM)
    const stateTransformer = stateTTrans<number>(maybeM)
    const ret = (a: number) => stateMonad.return(a)
    const baseState = mkStateT<number, number>((s) => just(tuple2(s + 1, s + 1)))
    const addState = (x: number) => mkStateT<number, number>((s) => just(tuple2(x + s, s + 1)))
    const doubleState = (x: number) => mkStateT<number, number>((s) => just(tuple2(x * 2, s + 1)))

    // Left identity
    t.same(fromMaybe(run(stateMonad['>>='](ret(2), addState), 0)), fromMaybe(run(addState(2), 0)))

    // Right identity
    t.same(fromMaybe(run(stateMonad['>>='](baseState, stateMonad.return), 0)), fromMaybe(run(baseState, 0)))

    // Associativity
    t.same(
        fromMaybe(run(stateMonad['>>='](stateMonad['>>='](baseState, addState), doubleState), 0)),
        fromMaybe(
            run(
                stateMonad['>>='](baseState, (x: number) => stateMonad['>>='](addState(x), doubleState)),
                0,
            ),
        ),
    )

    // lift
    const lifted = stateTransformer.lift(just(5))
    t.same(fromMaybe(run(lifted, 3)), [5, 3])
})

tap.test('StateT practical usage: counter', async (t) => {
    const stateMonad2 = stateTMonad<number>(maybeM)
    const get = mkStateT<number, number>((s) => just(tuple2(s, s)))
    const put = (s: number) => mkStateT<number, []>(() => just(tuple2([], s)))

    const program = stateMonad2['>>='](get, (n: number) => stateMonad2['>>='](put(n + 1), () => stateMonad2.return(n)))
    const [v, s] = fromMaybe(run(program, 10))
    t.equal(v, 10)
    t.equal(s, 11)
})
