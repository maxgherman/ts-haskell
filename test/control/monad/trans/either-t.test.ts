import tap from 'tap'
import { monad as promiseMonad } from 'extra/promise/monad'
import { right, left, $case, EitherBox } from 'data/either/either'
import { functor as eitherTFunctor } from 'control/monad/trans/either/functor'
import { applicative as eitherTApplicative } from 'control/monad/trans/either/applicative'
import { monad as eitherTMonad } from 'control/monad/trans/either/monad'
import {
    eitherT as mkEitherT,
    runEitherT as runEitherTHelper,
    lift as liftLocal,
} from 'control/monad/trans/either/either-t'
import { eitherT as eitherTTrans } from 'control/monad/trans/monad-trans'

const promiseMonadInstance = promiseMonad

const toPromise = <T>(x: unknown): Promise<T> => x as Promise<T>

const fromEither = async <E, A>(pea: unknown): Promise<A> => {
    const ea = (await toPromise<EitherBox<E, A>>(pea)) as EitherBox<E, A>
    return $case<E, A, A>({
        right: (x) => x,
        left: (e) => {
            throw new Error('Left: ' + String(e))
        },
    })(ea)
}

tap.test('EitherT Functor and derived ops', async (t) => {
    const eitherTFunctorInstance = eitherTFunctor<number>(promiseMonadInstance)
    const eitherSource = mkEitherT<number, number>(
        () => Promise.resolve(right(2)) as unknown as import('data/kind').MinBox1<EitherBox<number, number>>,
    )

    // fmap
    const mapped = eitherTFunctorInstance.fmap((x: number) => x + 3, eitherSource)
    t.equal(await fromEither(runEitherTHelper(mapped)), 5)

    // <$>
    const appliedResult = eitherTFunctorInstance['<$>']((x: number) => x * 4, eitherSource)
    t.equal(await fromEither(runEitherTHelper(appliedResult)), 8)

    // <$ (replace value)
    const replacedResult = eitherTFunctorInstance['<$']('a', eitherSource)
    t.equal(await fromEither(runEitherTHelper(replacedResult)), 'a')

    // $> (keep right)
    const keepRightResult = eitherTFunctorInstance['$>'](eitherSource, true)
    t.equal(await fromEither(runEitherTHelper(keepRightResult)), true)

    // <&>
    const mappedRightResult = eitherTFunctorInstance['<&>'](eitherSource, (x: number) => x - 1)
    t.equal(await fromEither(runEitherTHelper(mappedRightResult)), 1)
})
tap.test('EitherT Applicative and sequencing', async (t) => {
    const eitherTApplicativeInstance = eitherTApplicative<string>(promiseMonadInstance)

    // pure
    t.equal(await fromEither(runEitherTHelper(eitherTApplicativeInstance.pure(9))), 9)

    // <*> with both Right
    const functionInEitherT = mkEitherT<string, (_: number) => number>(
        () =>
            Promise.resolve(right((x: number) => x + 1)) as unknown as import('data/kind').MinBox1<
                EitherBox<string, (_: number) => number>
            >,
    )
    const valueInEitherT = mkEitherT<string, number>(
        () => Promise.resolve(right(10)) as unknown as import('data/kind').MinBox1<EitherBox<string, number>>,
    )
    t.equal(
        await fromEither(runEitherTHelper(eitherTApplicativeInstance['<*>'](functionInEitherT, valueInEitherT))),
        11,
    )

    // <*> with Left function
    const functionLeft = mkEitherT<string, (_: number) => number>(
        () =>
            Promise.resolve(left('errF')) as unknown as import('data/kind').MinBox1<
                EitherBox<string, (_: number) => number>
            >,
    )
    const resultLeft = await toPromise(
        runEitherTHelper(eitherTApplicativeInstance['<*>'](functionLeft, valueInEitherT)),
    )
    t.equal($case<string, number, string>({ left: (e) => e })(resultLeft as EitherBox<string, number>), 'errF')

    // liftA2 and derived ops <* , *>
    const firstEitherValue = mkEitherT<string, number>(
        () => Promise.resolve(right(2)) as unknown as import('data/kind').MinBox1<EitherBox<string, number>>,
    )
    const secondEitherValue = mkEitherT<string, number>(
        () => Promise.resolve(right(3)) as unknown as import('data/kind').MinBox1<EitherBox<string, number>>,
    )
    t.equal(
        await fromEither(
            runEitherTHelper(
                eitherTApplicativeInstance.liftA2(
                    (x: number) => (y: number) => x + y,
                    firstEitherValue,
                    secondEitherValue,
                ),
            ),
        ),
        5,
    )

    t.equal(
        await fromEither(runEitherTHelper(eitherTApplicativeInstance['<*'](firstEitherValue, secondEitherValue))),
        2,
    )
    t.equal(
        await fromEither(runEitherTHelper(eitherTApplicativeInstance['*>'](firstEitherValue, secondEitherValue))),
        3,
    )
})

tap.test('EitherT Monad bind/return/>> and lifts', async (t) => {
    const eitherTMonadInstance = eitherTMonad<string>(promiseMonadInstance)
    const returnValue = (x: number) => eitherTMonadInstance.return(x)

    // >>= success
    const doubleValue = (x: number) =>
        mkEitherT<string, number>(
            () => Promise.resolve(right(x * 2)) as unknown as import('data/kind').MinBox1<EitherBox<string, number>>,
        )
    t.equal(await fromEither(runEitherTHelper(eitherTMonadInstance['>>='](returnValue(5), doubleValue))), 10)

    // >>= propagate Left
    const leftValue = mkEitherT<string, number>(
        () => Promise.resolve(left('oops')) as unknown as import('data/kind').MinBox1<EitherBox<string, number>>,
    )
    const resultFromLeft = await toPromise(runEitherTHelper(eitherTMonadInstance['>>='](leftValue, doubleValue)))
    t.equal($case<string, number, string>({ left: (e) => e })(resultFromLeft as EitherBox<string, number>), 'oops')

    // >> sequencing
    const firstAction = mkEitherT<string, number>(
        () => Promise.resolve(right(1)) as unknown as import('data/kind').MinBox1<EitherBox<string, number>>,
    )
    const secondAction = mkEitherT<string, string>(
        () => Promise.resolve(right('ok')) as unknown as import('data/kind').MinBox1<EitherBox<string, string>>,
    )
    const sequencedResult = eitherTMonadInstance['>>'](firstAction, secondAction)
    t.equal(await fromEither(runEitherTHelper(sequencedResult)), 'ok')

    // local lift
    const liftedLocal = liftLocal<string, number>(
        promiseMonadInstance,
        Promise.resolve(42) as unknown as import('data/kind').MinBox1<number>,
    )
    t.equal(await fromEither(runEitherTHelper(liftedLocal)), 42)

    // class lift (MonadTrans.eitherT)
    const eitherTTransformer = eitherTTrans<string>(promiseMonadInstance)
    const liftedViaTransformer = eitherTTransformer.lift(
        Promise.resolve(7) as unknown as import('data/kind').MinBox1<number>,
    )
    t.equal(await fromEither(runEitherTHelper(liftedViaTransformer)), 7)
})

tap.test('EitherT kind function', async (t) => {
    const kindCheckObj = mkEitherT<string, string>(
        () => Promise.resolve(right('x')) as unknown as import('data/kind').MinBox1<EitherBox<string, string>>,
    )
    const kindFn = (kindCheckObj as unknown as { kind: (_: unknown) => (_: unknown) => string }).kind
    t.equal(kindFn('*')('*'), '*')
})
