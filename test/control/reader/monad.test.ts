import tap from 'tap'
import { monad as createMonad } from 'control/reader/monad'
import { reader, ReaderBox } from 'control/reader/reader'
import { doNotation } from 'ghc/base/monad/do-notation'
import { $case as maybeCase, just, nothing, MaybeBox } from 'ghc/base/maybe/maybe'
import { monad as maybeMonad } from 'ghc/base/maybe/monad'
import {
    $case as eitherCase,
    left,
    right,
    EitherBox,
} from 'data/either/either'
import { monad as eitherMonad } from 'data/either/monad'
import { tuple2, fst, snd, Tuple2Box } from 'ghc/base/tuple/tuple'

const monad = createMonad<string>()

const run = <A>(r: ReaderBox<string, A>, env: string) => r.runReader(env)

tap.test('Reader monad', async (t) => {
    t.test('return', async (t) => {
        const result = monad.pure(3)

        t.equal(run(result, 'env'), 3)
    })

    t.test('>>=', async (t) => {
        const value = reader((env: string) => env.length)
        const f = (x: number) => reader((env: string) => x + env.length)

        const result = monad['>>='](value, f)

        t.equal(run(result, 'abcd'), 8)
    })

    t.test('>>', async (t) => {
        const value1 = reader((env: string) => env.length)
        const value2 = reader((env: string) => env.toUpperCase())

        const result = monad['>>'](value1, value2)

        t.equal(run(result, 'abc'), 'ABC')
    })

    t.test('Monad first law (Left identity): return a >>= h = h a', async (t) => {
        const a = 5
        const returnA = monad.return(a)
        const h = (x: number) => reader((env: string) => x + env.length)

        const left = monad['>>='](returnA, h)
        const right = h(a)

        t.equal(run(left, 'abcd'), run(right, 'abcd'))
        t.equal(run(right, 'abcd'), 9)
    })

    t.test('Monad second law (Right identity): m >>= return = m', async (t) => {
        const m = reader((env: string) => env.length)
        const left = monad['>>='](m, monad.return)

        t.equal(run(left, 'abcd'), run(m, 'abcd'))
        t.equal(run(left, 'abcd'), 4)
    })

    t.test('Monad thrird law (Associativity): (m >>= g) >>= h = m >>= (x -> g x >>= h)', async (t) => {
        const m = reader((env: string) => env.length)
        const g = (x: number) => reader((env: string) => x + env.length)
        const h = (x: number) => reader((env: string) => x * 2)

        const left = monad['>>='](monad['>>='](m, g), h)
        const right = monad['>>='](m, (x: number) => monad['>>='](g(x), h))

        t.equal(run(left, 'abc'), run(right, 'abc'))
        t.equal(run(left, 'abc'), 12)
    })

    t.test('do-notation', async (t) => {
        const result = doNotation<ReaderBox<string, number>>(function* (): Generator<
            ReaderBox<string, number>,
            number,
            number
        > {
            const value1 = (yield reader((env: string) => env.length)) as number
            const value2 = (yield reader((env: string) => env.length * 2)) as number
            return value1 + value2
        },
        monad)

        t.equal(run(result, 'abcd'), 12)
    })

    t.test('Monad with Maybe', async (t) => {
        const value = reader((env: string) => env.length)
        const f = (x: number) =>
            reader((env: string) =>
                env.includes('!') ? just(x + env.length) : nothing<number>(),
            )

        const result = monad['>>='](value, f)

        const runMaybe = (env: string) =>
            maybeCase<number, number | undefined>({
                just: (x) => x,
                nothing: () => undefined,
            })(run(result, env) as MaybeBox<number>)

        t.equal(runMaybe('abc!'), 8)
        t.equal(runMaybe('abc'), undefined)
        t.equal(runMaybe(''), undefined)
    })

    t.test('Monad with Maybe and do-notation', async (t) => {
        const maybeM = maybeMonad
        const result = doNotation<ReaderBox<string, MaybeBox<number>>>(function* (): Generator<
            ReaderBox<string, MaybeBox<number>>,
            MaybeBox<number>,
            MaybeBox<number>
        > {
            const value1 = (yield reader((env: string) =>
                env.length > 0 ? just(env.length) : nothing<number>(),
            )) as MaybeBox<number>
            const value2 = (yield reader((env: string) =>
                env.includes('!')
                    ? just(env.length * 2)
                    : nothing<number>(),
            )) as MaybeBox<number>

            return maybeM['>>='](value1, (x: number) =>
                maybeM['>>='](value2, (y: number) => maybeM.pure(x + y)),
            )
        }, monad)

        const runMaybe = (env: string) =>
            maybeCase<number, number | undefined>({
                just: (x) => x,
                nothing: () => undefined,
            })(run(result, env) as MaybeBox<number>)

        t.equal(runMaybe('abc!'), 12)
        t.equal(runMaybe('abc'), undefined)
        t.equal(runMaybe(''), undefined)
    })

    t.test('Monad with Either', async (t) => {
        const value = reader((env: string) => env.length)
        const f = (x: number) =>
            reader((env: string) =>
                env.length === 0
                    ? left<string, number>('empty')
                    : env.includes('!')
                    ? right<string, number>(x + env.length)
                    : left<string, number>('no bang'),
            )

        const result = monad['>>='](value, f)

        const runEither = (env: string) =>
            eitherCase<string, number, string | number>({
                left: (l) => l,
                right: (r) => r,
            })(run(result, env) as EitherBox<string, number>)

        t.equal(runEither('abc!'), 8)
        t.equal(runEither(''), 'empty')
        t.equal(runEither('abc'), 'no bang')
    })

    t.test('Monad with Either and do-notation', async (t) => {
        const eitherM = eitherMonad<string>()
        const result = doNotation<ReaderBox<string, EitherBox<string, number>>>(function* (): Generator<
            ReaderBox<string, EitherBox<string, number>>,
            EitherBox<string, number>,
            EitherBox<string, number>
        > {
            const value1 = (yield reader((env: string) =>
                env.length > 0
                    ? right<string, number>(env.length)
                    : left<string, number>('empty'),
            )) as EitherBox<string, number>
            const value2 = (yield reader((env: string) =>
                env.includes('!')
                    ? right<string, number>(env.length * 2)
                    : left<string, number>('no bang'),
            )) as EitherBox<string, number>

            return eitherM['>>='](value1, (x: number) =>
                eitherM['>>='](value2, (y: number) => eitherM.pure(x + y)),
            )
        }, monad)

        const runEither = (env: string) =>
            eitherCase<string, number, string | number>({
                left: (l) => l,
                right: (r) => r,
            })(run(result, env) as EitherBox<string, number>)

        t.equal(runEither('abc!'), 12)
        t.equal(runEither(''), 'empty')
        t.equal(runEither('abc'), 'no bang')
    })

    t.test('Monad with Tuple', async (t) => {
        const value = reader((env: string) => tuple2(env.length, env.toUpperCase()))
        const f = (tuple: Tuple2Box<number, string>) =>
            reader((env: string) =>
                tuple2(fst(tuple) + env.length, snd(tuple) + env.toLowerCase()),
            )

        const result = monad['>>='](value, f)

        const runTuple = (env: string): [number, string] => {
            const tuple = run(result, env) as Tuple2Box<number, string>
            return [fst(tuple), snd(tuple)]
        }

        t.same(runTuple('abc'), [6, 'ABCabc'])
    })

    t.test('Monad with Tuple and do-notation', async (t) => {
        const result = doNotation<ReaderBox<string, Tuple2Box<number, string>>>(function* (): Generator<
            ReaderBox<string, Tuple2Box<number, string>>,
            Tuple2Box<number, string>,
            Tuple2Box<number, string>
        > {
            const tuple1 = (yield reader((env: string) =>
                tuple2(env.length, env.toUpperCase()),
            )) as Tuple2Box<number, string>
            const tuple2Val = (yield reader((env: string) =>
                tuple2(env.length * 2, env.toLowerCase()),
            )) as Tuple2Box<number, string>

            return tuple2(
                fst(tuple1) + fst(tuple2Val),
                snd(tuple1) + snd(tuple2Val),
            )
        }, monad)

        const runTuple = (env: string): [number, string] => {
            const tuple = run(result, env) as Tuple2Box<number, string>
            return [fst(tuple), snd(tuple)]
        }

        t.same(runTuple('abc'), [9, 'ABCabc'])
    })
})

