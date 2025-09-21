import tap from 'tap'
import { monad as promiseMonad } from 'extra/promise/monad'
import { right, $case, EitherBox } from 'data/either/either'
import { functor as exceptTFunctor } from 'control/monad/trans/except/functor'
import { applicative as exceptTApplicative } from 'control/monad/trans/except/applicative'
import { monad as exceptTMonad } from 'control/monad/trans/except/monad'
import {
    exceptT as mkExceptT,
    runExceptT as runExceptTHelper,
    lift as liftLocal,
} from 'control/monad/trans/except/except-t'
import { exceptT as exceptTTrans } from 'control/monad/trans/monad-trans'
import { MinBox1 } from 'data/kind'

const promiseMonadInstance = promiseMonad

const toPromise = <T>(x: unknown): Promise<T> => x as Promise<T>

const fromExcept = async <E, A>(pea: unknown): Promise<A> => {
    const ea = (await toPromise<EitherBox<E, A>>(pea)) as EitherBox<E, A>
    return $case<E, A, A>({ right: (x) => x })(ea)
}

tap.test('ExceptT behaves as EitherT: Functor/Applicative/Monad and lifts', async (t) => {
    const exceptTFunctorInstance = exceptTFunctor<string>(promiseMonadInstance)
    const exceptTApplicativeInstance = exceptTApplicative<string>(promiseMonadInstance)
    const exceptTMonadInstance = exceptTMonad<string>(promiseMonadInstance)

    const sourceExcept = mkExceptT<string, number>(
        () => Promise.resolve(right(3)) as unknown as MinBox1<EitherBox<string, number>>,
    )
    t.equal(await fromExcept(runExceptTHelper(exceptTFunctorInstance['<$>']((x: number) => x + 1, sourceExcept))), 4)

    const functionInExceptT = mkExceptT<string, (_: number) => number>(
        () =>
            Promise.resolve(right((x: number) => x * 2)) as unknown as MinBox1<
                EitherBox<string, (_: number) => number>
            >,
    )
    t.equal(await fromExcept(runExceptTHelper(exceptTApplicativeInstance['<*>'](functionInExceptT, sourceExcept))), 6)

    const returnValue = (x: number) => exceptTMonadInstance.return(x)
    t.equal(
        await fromExcept(runExceptTHelper(exceptTMonadInstance['>>='](returnValue(5), (n: number) => sourceExcept))),
        3,
    )

    // local lift
    const liftedLocal = liftLocal<string, number>(
        promiseMonadInstance,
        Promise.resolve(9) as unknown as MinBox1<number>,
    )
    t.equal(await fromExcept(runExceptTHelper(liftedLocal)), 9)

    // class lift via MonadTrans
    const exceptTTransformer = exceptTTrans<string>(promiseMonadInstance)
    const liftedViaTransformer = exceptTTransformer.lift(Promise.resolve(7) as unknown as MinBox1<number>)
    t.equal(await fromExcept(runExceptTHelper(liftedViaTransformer)), 7)
})
