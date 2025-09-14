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

const maybeM = maybeMonad

const run = <R, A>(ra: ReaderTBox<R, A>, r: R): MaybeBox<A> => ra.runReaderT(r) as MaybeBox<A>
const fromMaybe = <A>(ma: MaybeBox<A>): A | null => $case<A, A | null>({ nothing: () => null, just: (x) => x })(ma)

tap.test('ReaderT Functor laws', async (t) => {
    const readerFunctor = readerTFunctor<number>(maybeM)
    const incrementEnv = mkReaderT<number, number>((r) => just(r + 1))

    // Identity
    t.equal(
        fromMaybe(
            run(
                readerFunctor.fmap((x: number) => x, incrementEnv),
                2,
            ),
        ),
        fromMaybe(run(incrementEnv, 2)),
    )

    // Composition
    const addTwo = (n: number) => n + 2
    const timesThree = (n: number) => n * 3
    t.equal(
        fromMaybe(
            run(
                readerFunctor.fmap((x: number) => addTwo(timesThree(x)), incrementEnv),
                3,
            ),
        ),
        fromMaybe(run(readerFunctor.fmap(addTwo, readerFunctor.fmap(timesThree, incrementEnv)), 3)),
    )
})

tap.test('ReaderT Applicative laws/basic', async (t) => {
    const readerApplicative = readerTApplicative<number>(maybeM)
    const plusOne = mkReaderT<number, number>((r) => just(r + 1))
    const identity = (x: number) => x
    // Identity: pure id <*> plusOne = plusOne
    t.equal(
        fromMaybe(run(readerApplicative['<*>'](readerApplicative.pure(identity), plusOne), 5)),
        fromMaybe(run(plusOne, 5)),
    )

    // Homomorphism: pure f <*> pure x = pure (f x)
    const addTen = (n: number) => n + 10
    t.equal(
        fromMaybe(run(readerApplicative['<*>'](readerApplicative.pure(addTen), readerApplicative.pure(1)), 0)),
        fromMaybe(run(readerApplicative.pure(addTen(1)), 0)),
    )

    // Interchange: u <*> pure y = pure ($ y) <*> u
    const doubleFnReader = readerApplicative.pure((n: number) => n * 2)
    const yValue = 7
    t.equal(
        fromMaybe(run(readerApplicative['<*>'](doubleFnReader, readerApplicative.pure(yValue)), 9)),
        fromMaybe(
            run(
                readerApplicative['<*>'](
                    readerApplicative.pure((f: (x: number) => number) => f(yValue)),
                    doubleFnReader,
                ),
                9,
            ),
        ),
    )
})

tap.test('ReaderT Applicative liftA2', async (t) => {
    const readerApplicative2 = readerTApplicative<number>(maybeM)
    const plusTwo = mkReaderT<number, number>((r) => just(r + 2))
    const timesThreeReader = mkReaderT<number, number>((r) => just(r * 3))
    const r = fromMaybe(
        run(
            readerApplicative2.liftA2((a: number) => (b: number) => a + b, plusTwo, timesThreeReader),
            4,
        ),
    )
    t.equal(r, 4 + 2 + 4 * 3)
})

tap.test('ReaderT Monad laws', async (t) => {
    const readerMonad = readerTMonad<number>(maybeM)
    const addEnvIfPositive = (x: number) => mkReaderT<number, number>((r) => (x + r > 0 ? just(x + r) : nothing()))
    const timesTwo = (x: number) => mkReaderT<number, number>(() => just(x * 2))

    const base = 3
    const minusOneFromEnv = mkReaderT<number, number>((r) => just(r - 1))

    // Left identity: return a >>= f == f a
    t.equal(
        fromMaybe(run(readerMonad['>>='](readerMonad.return(base), addEnvIfPositive), 5)),
        fromMaybe(run(addEnvIfPositive(base), 5)),
    )

    // Right identity: m >>= return == m
    t.equal(
        fromMaybe(run(readerMonad['>>='](minusOneFromEnv, readerMonad.return), 5)),
        fromMaybe(run(minusOneFromEnv, 5)),
    )

    // Associativity: (m >>= f) >>= g == m >>= (\x -> f x >>= g)
    t.equal(
        fromMaybe(run(readerMonad['>>='](readerMonad['>>='](minusOneFromEnv, addEnvIfPositive), timesTwo), 5)),
        fromMaybe(
            run(
                readerMonad['>>='](minusOneFromEnv, (x: number) => readerMonad['>>='](addEnvIfPositive(x), timesTwo)),
                5,
            ),
        ),
    )
})

tap.test('ReaderT MonadTrans lift', async (t) => {
    const readerTransformer = readerTTrans<number>(maybeM)
    const readerMonad2 = readerTMonad<number>(maybeM)
    const lifted = readerTransformer.lift(just(5))

    t.equal(fromMaybe(run(lifted, 0)), 5)

    // lift (return a) = return a
    t.equal(fromMaybe(run(readerTransformer.lift(maybeM.return(7)), 1)), fromMaybe(run(readerMonad2.return(7), 1)))

    // lift (m >>= k) = lift m >>= (x -> lift (k x))
    const addOne = (x: number) => just(x + 1)
    const leftHandSide = readerTransformer.lift(maybeM['>>='](just(2), addOne))
    const rightHandSide = readerMonad2['>>='](readerTransformer.lift(just(2)), (x: number) =>
        readerTransformer.lift(addOne(x)),
    )
    t.equal(fromMaybe(run(leftHandSide, 3)), fromMaybe(run(rightHandSide, 3)))
})

tap.test('ReaderT practical usage', async (t) => {
    const readerMonad3 = readerTMonad<number>(maybeM)
    const readPositive = mkReaderT<number, number>((r) => (r > 0 ? just(r) : nothing()))
    const addEnv = (x: number) => mkReaderT<number, number>((r) => just(x + r))

    const program = readerMonad3['>>='](readPositive, addEnv)
    t.equal(fromMaybe(run(program, 5)), 10)
    t.equal(fromMaybe(run(program, -1)), null)
})

tap.test('ReaderT run helper and local lift', async (t) => {
    const lifted = liftLocal<number, number>(maybeM, just(99))
    t.equal(fromMaybe(runReaderTHelper(lifted, 123) as MaybeBox<number>), 99)
})

tap.test('ReaderT kind function', async (t) => {
    const readerForKind = mkReaderT<number, number>(() => just(1))
    const kindFn = (readerForKind as unknown as { kind: (_: unknown) => (_: unknown) => string }).kind
    const kindValue = kindFn('*')('*')
    t.equal(kindValue, '*')
})
