import tap from 'tap'
import { monad as maybeMonad } from 'ghc/base/maybe/monad'
import { just, nothing, $case, MaybeBox } from 'ghc/base/maybe/maybe'
import { functor as readerTFunctor } from 'control/monad/trans/reader/functor'
import { applicative as readerTApplicative } from 'control/monad/trans/reader/applicative'
import { monad as readerTMonad } from 'control/monad/trans/reader/monad'
import {
    readerT as mkReaderT,
    ReaderTBox,
    runReaderT as runReaderTHelper,
    lift as liftLocal,
} from 'control/monad/trans/reader/reader-t'
import { readerT as readerTTrans } from 'control/monad/trans/monad-trans'

const M = maybeMonad

const run = <R, A>(ra: ReaderTBox<R, A>, r: R): MaybeBox<A> => ra.runReaderT(r) as MaybeBox<A>
const fromMaybe = <A>(ma: MaybeBox<A>): A | null => $case<A, A | null>({ nothing: () => null, just: (x) => x })(ma)

tap.test('ReaderT Functor laws', async (t) => {
    const F = readerTFunctor<number>(M)
    const x = mkReaderT<number, number>((r) => just(r + 1))

    // Identity
    t.equal(
        fromMaybe(
            run(
                F.fmap((x: number) => x, x),
                2,
            ),
        ),
        fromMaybe(run(x, 2)),
    )

    // Composition
    const f = (n: number) => n + 2
    const g = (n: number) => n * 3
    t.equal(
        fromMaybe(
            run(
                F.fmap((x: number) => f(g(x)), x),
                3,
            ),
        ),
        fromMaybe(run(F.fmap(f, F.fmap(g, x)), 3)),
    )
})

tap.test('ReaderT Applicative laws/basic', async (t) => {
    const A = readerTApplicative<number>(M)
    const v = mkReaderT<number, number>((r) => just(r + 1))
    const id = (x: number) => x
    // Identity: pure id <*> v = v
    t.equal(fromMaybe(run(A['<*>'](A.pure(id), v), 5)), fromMaybe(run(v, 5)))

    // Homomorphism: pure f <*> pure x = pure (f x)
    const f = (n: number) => n + 10
    t.equal(fromMaybe(run(A['<*>'](A.pure(f), A.pure(1)), 0)), fromMaybe(run(A.pure(f(1)), 0)))

    // Interchange: u <*> pure y = pure ($ y) <*> u
    const u = A.pure((n: number) => n * 2)
    const y = 7
    t.equal(
        fromMaybe(run(A['<*>'](u, A.pure(y)), 9)),
        fromMaybe(
            run(
                A['<*>'](
                    A.pure((f: (x: number) => number) => f(y)),
                    u,
                ),
                9,
            ),
        ),
    )
})

tap.test('ReaderT Applicative liftA2', async (t) => {
    const A = readerTApplicative<number>(M)
    const ra = mkReaderT<number, number>((r) => just(r + 2))
    const rb = mkReaderT<number, number>((r) => just(r * 3))
    const r = fromMaybe(
        run(
            A.liftA2((a: number) => (b: number) => a + b, ra, rb),
            4,
        ),
    )
    t.equal(r, 4 + 2 + 4 * 3)
})

tap.test('ReaderT Monad laws', async (t) => {
    const R = readerTMonad<number>(M)
    const f = (x: number) => mkReaderT<number, number>((r) => (x + r > 0 ? just(x + r) : nothing()))
    const g = (x: number) => mkReaderT<number, number>(() => just(x * 2))

    const a = 3
    const m = mkReaderT<number, number>((r) => just(r - 1))

    // Left identity: return a >>= f == f a
    t.equal(fromMaybe(run(R['>>='](R.return(a), f), 5)), fromMaybe(run(f(a), 5)))

    // Right identity: m >>= return == m
    t.equal(fromMaybe(run(R['>>='](m, R.return), 5)), fromMaybe(run(m, 5)))

    // Associativity: (m >>= f) >>= g == m >>= (\x -> f x >>= g)
    t.equal(
        fromMaybe(run(R['>>='](R['>>='](m, f), g), 5)),
        fromMaybe(
            run(
                R['>>='](m, (x: number) => R['>>='](f(x), g)),
                5,
            ),
        ),
    )
})

tap.test('ReaderT MonadTrans lift', async (t) => {
    const RT = readerTTrans<number>(M)
    const R = readerTMonad<number>(M)
    const lifted = RT.lift(just(5))

    t.equal(fromMaybe(run(lifted, 0)), 5)

    // lift (return a) = return a
    t.equal(fromMaybe(run(RT.lift(M.return(7)), 1)), fromMaybe(run(R.return(7), 1)))

    // lift (m >>= k) = lift m >>= (x -> lift (k x))
    const k = (x: number) => just(x + 1)
    const lhs = RT.lift(M['>>='](just(2), k))
    const rhs = R['>>='](RT.lift(just(2)), (x: number) => RT.lift(k(x)))
    t.equal(fromMaybe(run(lhs, 3)), fromMaybe(run(rhs, 3)))
})

tap.test('ReaderT practical usage', async (t) => {
    const R = readerTMonad<number>(M)
    const readPositive = mkReaderT<number, number>((r) => (r > 0 ? just(r) : nothing()))
    const addEnv = (x: number) => mkReaderT<number, number>((r) => just(x + r))

    const program = R['>>='](readPositive, addEnv)
    t.equal(fromMaybe(run(program, 5)), 10)
    t.equal(fromMaybe(run(program, -1)), null)
})

tap.test('ReaderT run helper and local lift', async (t) => {
    const lifted = liftLocal<number, number>(M, just(99))
    t.equal(fromMaybe(runReaderTHelper(lifted, 123) as MaybeBox<number>), 99)
})

tap.test('ReaderT kind function', async (t) => {
    const x = mkReaderT<number, number>(() => just(1))
    const kindFn = (x as unknown as { kind: (_: unknown) => (_: unknown) => string }).kind
    const k = kindFn('*')('*')
    t.equal(k, '*')
})
