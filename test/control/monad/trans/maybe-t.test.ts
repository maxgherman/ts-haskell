import tap from 'tap'
import { monad as promiseMonad } from 'extra/promise/monad'
import { just, nothing, $case, MaybeBox } from 'ghc/base/maybe/maybe'
import { functor as maybeTFunctor } from 'control/monad/trans/maybe/functor'
import { applicative as maybeTApplicative } from 'control/monad/trans/maybe/applicative'
import { monad as maybeTMonad } from 'control/monad/trans/maybe/monad'
import { maybeT as mkMaybeT, runMaybeT as runMaybeTHelper, lift as liftLocal } from 'control/monad/trans/maybe/maybe-t'
import { maybeT as maybeTTrans } from 'control/monad/trans/monad-trans'
import { monad as stateTMonad } from 'control/monad/trans/state/monad'
import { stateT as mkStateT, runStateT, tuple as stTuple, StateTBox } from 'control/monad/trans/state/state-t'
import { monad as readerTMonad } from 'control/monad/trans/reader/monad'
import { readerT as mkReaderT, runReaderT, ReaderTBox } from 'control/monad/trans/reader/reader-t'
import { monad as writerTMonad } from 'control/monad/trans/writer/monad'
import { writerT as mkWriterT, runWriterT, tuple as wrTuple, WriterTBox } from 'control/monad/trans/writer/writer-t'
import { monoid as listMonoid } from 'ghc/base/list/monoid'
import { cons, nil, toArray, ListBox } from 'ghc/base/list/list'
import type { Tuple2Box } from 'ghc/base/tuple/tuple'

const promiseMonadInstance = promiseMonad

const toPromise = <T>(x: unknown): Promise<T> => x as Promise<T>

const fromMaybe = async <A>(pma: unknown): Promise<A> => {
    const ma = (await toPromise<MaybeBox<A>>(pma)) as MaybeBox<A>
    return $case<A, A>({
        just: (x) => x,
        nothing: () => {
            throw new Error('Nothing')
        },
    })(ma)
}

tap.test('MaybeT Functor and derived ops', async (t) => {
    const maybeTFunctorInstance = maybeTFunctor(promiseMonadInstance)
    const maybeSource = mkMaybeT<number>(
        () => Promise.resolve(just(2)) as unknown as import('data/kind').MinBox1<MaybeBox<number>>,
    )

    // fmap
    const mapped = maybeTFunctorInstance.fmap((x: number) => x + 3, maybeSource)
    t.equal(await fromMaybe(runMaybeTHelper(mapped)), 5)

    // <$>
    const appliedResult = maybeTFunctorInstance['<$>']((x: number) => x * 4, maybeSource)
    t.equal(await fromMaybe(runMaybeTHelper(appliedResult)), 8)

    // <$ (replace value)
    const replacedResult = maybeTFunctorInstance['<$']('a', maybeSource)
    t.equal(await fromMaybe(runMaybeTHelper(replacedResult)), 'a')

    // $> (keep right)
    const keepRightResult = maybeTFunctorInstance['$>'](maybeSource, true)
    t.equal(await fromMaybe(runMaybeTHelper(keepRightResult)), true)

    // <&>
    const mappedRightResult = maybeTFunctorInstance['<&>'](maybeSource, (x: number) => x - 1)
    t.equal(await fromMaybe(runMaybeTHelper(mappedRightResult)), 1)

    // void
    const voidedResult = maybeTFunctorInstance.void(maybeSource)
    t.same(await fromMaybe(runMaybeTHelper(voidedResult)), [])
})
tap.test('MaybeT Applicative and sequencing', async (t) => {
    const maybeTApplicativeInstance = maybeTApplicative(promiseMonadInstance)

    // pure
    t.equal(await fromMaybe(runMaybeTHelper(maybeTApplicativeInstance.pure(9))), 9)

    // <*> with both Just
    const functionInMaybeT = mkMaybeT<(_: number) => number>(
        () =>
            Promise.resolve(just((x: number) => x + 1)) as unknown as import('data/kind').MinBox1<
                MaybeBox<(_: number) => number>
            >,
    )
    const valueInMaybeT = mkMaybeT<number>(
        () => Promise.resolve(just(10)) as unknown as import('data/kind').MinBox1<MaybeBox<number>>,
    )
    t.equal(await fromMaybe(runMaybeTHelper(maybeTApplicativeInstance['<*>'](functionInMaybeT, valueInMaybeT))), 11)

    // <*> with Nothing function
    const functionNothing = mkMaybeT<(_: number) => number>(
        () => Promise.resolve(nothing()) as unknown as import('data/kind').MinBox1<MaybeBox<(_: number) => number>>,
    )
    const resultNothing = await toPromise(
        runMaybeTHelper(maybeTApplicativeInstance['<*>'](functionNothing, valueInMaybeT)),
    )
    t.equal($case({ nothing: () => 'none', just: () => 'some' })(resultNothing as unknown as MaybeBox<number>), 'none')

    // liftA2 and derived ops <* , *>, <**>
    const firstValueMaybeT = mkMaybeT<number>(
        () => Promise.resolve(just(2)) as unknown as import('data/kind').MinBox1<MaybeBox<number>>,
    )
    const secondValueMaybeT = mkMaybeT<number>(
        () => Promise.resolve(just(3)) as unknown as import('data/kind').MinBox1<MaybeBox<number>>,
    )
    t.equal(
        await fromMaybe(
            runMaybeTHelper(
                maybeTApplicativeInstance.liftA2(
                    (x: number) => (y: number) => x + y,
                    firstValueMaybeT,
                    secondValueMaybeT,
                ),
            ),
        ),
        5,
    )

    t.equal(await fromMaybe(runMaybeTHelper(maybeTApplicativeInstance['<*'](firstValueMaybeT, secondValueMaybeT))), 2)
    t.equal(await fromMaybe(runMaybeTHelper(maybeTApplicativeInstance['*>'](firstValueMaybeT, secondValueMaybeT))), 3)
    t.equal(await fromMaybe(runMaybeTHelper(maybeTApplicativeInstance['<**>'](firstValueMaybeT, functionInMaybeT))), 3)
})

tap.test('MaybeT Monad bind/return/>> and lifts', async (t) => {
    const maybeTMonadInstance = maybeTMonad(promiseMonadInstance)
    const returnValue = (x: number) => maybeTMonadInstance.return(x)

    // >>= success
    const doubleValue = (x: number) =>
        mkMaybeT<number>(() => Promise.resolve(just(x * 2)) as unknown as import('data/kind').MinBox1<MaybeBox<number>>)
    t.equal(await fromMaybe(runMaybeTHelper(maybeTMonadInstance['>>='](returnValue(5), doubleValue))), 10)

    // >>= propagate Nothing
    const nothingInMaybeT = mkMaybeT<number>(
        () => Promise.resolve(nothing()) as unknown as import('data/kind').MinBox1<MaybeBox<number>>,
    )
    const resultFromNothing = await toPromise(runMaybeTHelper(maybeTMonadInstance['>>='](nothingInMaybeT, doubleValue)))
    t.equal(
        $case({ nothing: () => 'none', just: () => 'some' })(resultFromNothing as unknown as MaybeBox<number>),
        'none',
    )

    // >> sequencing
    const firstAction = mkMaybeT<number>(
        () => Promise.resolve(just(1)) as unknown as import('data/kind').MinBox1<MaybeBox<number>>,
    )
    const secondAction = mkMaybeT<string>(
        () => Promise.resolve(just('ok')) as unknown as import('data/kind').MinBox1<MaybeBox<string>>,
    )
    const sequencedResult = maybeTMonadInstance['>>'](firstAction, secondAction)
    t.equal(await fromMaybe(runMaybeTHelper(sequencedResult)), 'ok')

    // local lift
    const liftedLocal = liftLocal<number>(
        promiseMonadInstance,
        Promise.resolve(42) as unknown as import('data/kind').MinBox1<number>,
    )
    t.equal(await fromMaybe(runMaybeTHelper(liftedLocal)), 42)

    // class lift (MonadTrans.maybeT)
    const maybeTTransformer = maybeTTrans(promiseMonadInstance)
    const liftedViaTransformer = maybeTTransformer.lift(
        Promise.resolve(7) as unknown as import('data/kind').MinBox1<number>,
    )
    t.equal(await fromMaybe(runMaybeTHelper(liftedViaTransformer)), 7)
})

tap.test('MaybeT kind function', async (t) => {
    const kindCheckObj = mkMaybeT(
        () => Promise.resolve(just('x')) as unknown as import('data/kind').MinBox1<MaybeBox<string>>,
    )
    const kindFn = (kindCheckObj as unknown as { kind: (_: unknown) => string }).kind
    t.equal(kindFn('*'), '*')
})

tap.test('MaybeT over StateT with Promise base', async (t) => {
    const basePromise = promiseMonadInstance
    const stateTMonadInstance = stateTMonad<number>(basePromise)
    const maybeTOverStateMonad = maybeTMonad(stateTMonadInstance)
    const liftStateT = maybeTTrans(stateTMonadInstance).lift

    const incrementState = mkStateT<number, number>(
        (s: number) =>
            Promise.resolve(stTuple(s + 1, s + 1)) as unknown as import('data/kind').MinBox1<Tuple2Box<number, number>>,
    )

    const program = maybeTOverStateMonad['>>='](liftStateT(incrementState), (a: number) =>
        maybeTOverStateMonad['>>='](liftStateT(incrementState), (b: number) => maybeTOverStateMonad.return(a + b)),
    )

    const stateResult = (await toPromise(
        runStateT(runMaybeTHelper(program) as unknown as StateTBox<number, MaybeBox<number>>, 10),
    )) as Tuple2Box<MaybeBox<number>, number>
    const maybeValue = stateResult[0] as MaybeBox<number>
    t.equal($case({ just: (x: number) => x })(maybeValue), 23)
    t.equal(stateResult[1], 12)
})

tap.test('MaybeT over StateT short-circuits', async (t) => {
    const basePromise2 = promiseMonadInstance
    const stateTMonadInstance2 = stateTMonad<number>(basePromise2)
    const maybeTOverStateMonad2 = maybeTMonad(stateTMonadInstance2)
    const liftStateT2 = maybeTTrans(stateTMonadInstance2).lift

    const incrementState2 = mkStateT<number, number>(
        (s: number) =>
            Promise.resolve(stTuple(s + 1, s + 1)) as unknown as import('data/kind').MinBox1<Tuple2Box<number, number>>,
    )

    const failMaybeT = mkMaybeT<number>(
        () =>
            stateTMonadInstance2.return(nothing<number>()) as unknown as import('data/kind').MinBox1<MaybeBox<number>>,
    )

    const program2 = maybeTOverStateMonad2['>>='](liftStateT2(incrementState2), () =>
        maybeTOverStateMonad2['>>='](failMaybeT, () => liftStateT2(incrementState2)),
    )
    const stateResult2 = (await toPromise(
        runStateT(runMaybeTHelper(program2) as unknown as StateTBox<number, MaybeBox<number>>, 5),
    )) as Tuple2Box<MaybeBox<number>, number>
    const tagStr = $case({ nothing: () => 'none', just: () => 'some' })(stateResult2[0] as MaybeBox<number>)
    t.equal(tagStr, 'none')
    t.equal(stateResult2[1], 6)
})

tap.test('MaybeT over ReaderT with Promise base', async (t) => {
    const basePromise3 = promiseMonadInstance
    const readerTMonadInstance = readerTMonad<string>(basePromise3)
    const maybeTOverReaderMonad = maybeTMonad(readerTMonadInstance)
    const liftReaderT = maybeTTrans(readerTMonadInstance).lift

    const askReader = mkReaderT<string, string>(
        (r: string) => Promise.resolve(r) as unknown as import('data/kind').MinBox1<string>,
    )

    const programReader = maybeTOverReaderMonad['>>='](liftReaderT(askReader), (r: string) =>
        r.length > 0
            ? maybeTOverReaderMonad.return(r.toUpperCase())
            : mkMaybeT(() => readerTMonadInstance.return(nothing())),
    )

    const readerOut1 = (await toPromise(
        runReaderT(runMaybeTHelper(programReader) as unknown as ReaderTBox<string, MaybeBox<string>>, 'hi'),
    )) as MaybeBox<string>
    t.equal($case({ just: (x: string) => x })(readerOut1), 'HI')

    const readerOut2 = (await toPromise(
        runReaderT(runMaybeTHelper(programReader) as unknown as ReaderTBox<string, MaybeBox<string>>, ''),
    )) as MaybeBox<string>
    t.equal($case({ nothing: () => 'none', just: () => 'some' })(readerOut2), 'none')
})

tap.test('MaybeT over WriterT with Promise base and List log', async (t) => {
    const basePromise4 = promiseMonadInstance
    const listMonoidInstance = listMonoid<number>()
    const writerTMonadInstance = writerTMonad(basePromise4, listMonoidInstance)
    const maybeTOverWriterMonad = maybeTMonad(writerTMonadInstance)
    const liftWriterT = maybeTTrans(writerTMonadInstance).lift

    const tellList = (n: number) =>
        mkWriterT<ListBox<number>, []>(
            () =>
                Promise.resolve(wrTuple([], cons(n)(nil()))) as unknown as import('data/kind').MinBox1<
                    Tuple2Box<[], ListBox<number>>
                >,
        )

    const valueWriter = mkWriterT<ListBox<number>, number>(
        () =>
            Promise.resolve(wrTuple(10, cons(1)(nil()))) as unknown as import('data/kind').MinBox1<
                Tuple2Box<number, ListBox<number>>
            >,
    )

    const programWriter = maybeTOverWriterMonad['>>='](liftWriterT(valueWriter), (x: number) =>
        maybeTOverWriterMonad['>>='](liftWriterT(tellList(2)), () => maybeTOverWriterMonad.return(x + 5)),
    )

    const [maybeValue2, logList] = (await toPromise(
        runWriterT(runMaybeTHelper(programWriter) as unknown as WriterTBox<ListBox<number>, MaybeBox<number>>),
    )) as [MaybeBox<number>, ListBox<number>]
    t.equal($case({ just: (x: number) => x })(maybeValue2), 15)
    t.same(toArray(logList), [1, 2])
})
