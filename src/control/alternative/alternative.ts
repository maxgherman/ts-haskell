import { MinBox1 } from 'data/kind'
import { Applicative } from 'ghc/base/applicative'
import { ListBox, cons, nil, $null, concat as listConcat, toArray as listToArray } from 'ghc/base/list/list'

// Upper bound to stop list enumerations from trying to realize an infinite Apply expansion.
const LIST_SEQUENCE_LIMIT = 256

export type AlternativeBase = {
    empty<A>(): MinBox1<A>
    '<|>'<A>(fa: MinBox1<A>, fb: MinBox1<A>): MinBox1<A>
}

export type Alternative = Applicative &
    AlternativeBase & {
        some<A>(fa: MinBox1<A>): MinBox1<ListBox<A>>
        many<A>(fa: MinBox1<A>): MinBox1<ListBox<A>>
    }

export type BaseImplementation = Pick<AlternativeBase, 'empty' | '<|>'>

// Wraps recursive Alternative branches so the right-hand side is evaluated only on demand.
const defer = <A>(thunk: () => MinBox1<A>): MinBox1<A> => {
    let cached: MinBox1<A> | null = null

    const ensure = (): MinBox1<A> => {
        if (cached === null) {
            cached = thunk()

            if (cached && typeof cached === 'object') {
                for (const key of Object.keys(cached as object)) {
                    if (!(key in wrapper)) {
                        Object.defineProperty(wrapper, key, {
                            configurable: true,
                            get: () => (ensure() as Record<string, unknown>)[key],
                            set: (value: unknown) => {
                                ;(ensure() as Record<string, unknown>)[key] = value
                            },
                        })
                    }
                }
            }
        }

        return cached
    }

    const wrapper = (() => (ensure() as unknown as () => unknown)()) as unknown as MinBox1<A>

    Object.defineProperty(wrapper, 'kind', {
        configurable: true,
        get() {
            return (ensure() as { kind: unknown }).kind
        },
        set(value: unknown) {
            ;(ensure() as { kind: unknown }).kind = value
        },
    })

    return wrapper
}

// Detects List-style thunks so we can switch to breadth-first enumeration instead of lazy binds.
const isListLike = <A>(fa: MinBox1<A>): fa is ListBox<A> => {
    if (typeof fa !== 'function') {
        return false
    }

    try {
        const value = (fa as unknown as () => unknown)()
        if (Array.isArray(value)) {
            return true
        }

        return value != null && typeof value === 'object' && 'head' in value && 'tail' in value
    } catch {
        return false
    }
}

const buildListFromArray = <A>(values: A[]): ListBox<A> =>
    values.reduceRight((acc, value) => cons(value as NonNullable<A>)(acc), nil<A>())

const listSome = <A>(fa: ListBox<A>): ListBox<ListBox<A>> => {
    if ($null(fa)) {
        return nil()
    }

    const choices = listToArray(fa)

    const queue: A[][] = choices.map((choice) => [choice as NonNullable<A>])
    const sequences: ListBox<A>[] = []

    while (queue.length > 0 && sequences.length < LIST_SEQUENCE_LIMIT) {
        const current = queue.shift() as A[]
        sequences.push(buildListFromArray(current))

        for (const choice of choices) {
            if (sequences.length + queue.length >= LIST_SEQUENCE_LIMIT) {
                break
            }

            queue.push([...current, choice as NonNullable<A>])
        }
    }

    return sequences.reduceRight((acc, seq) => cons(seq)(acc), nil<ListBox<A>>())
}

const listMany = <A>(fa: ListBox<A>): ListBox<ListBox<A>> => {
    const singletonEmpty = cons<ListBox<A>>(nil<A>())(nil<ListBox<A>>())
    const some = listSome(fa) as unknown as ListBox<ListBox<A>>
    return listConcat(some, singletonEmpty)
}

export const alternative = (base: BaseImplementation, applicative: Applicative): Alternative => {
    const replicate = <A>(n: number, fa: MinBox1<A>): MinBox1<ListBox<A>> => {
        const fas = Array.from({ length: n }, () => fa)
        return fas.reduceRight<MinBox1<ListBox<A>>>(
            (acc, curr) =>
                applicative['<*>'](
                    applicative['<$>']((x: A) => (xs: ListBox<A>) => cons(x as NonNullable<A>)(xs), curr),
                    acc,
                ),
            applicative.pure(nil()),
        )
    }

    const some = <A>(fa: MinBox1<A>): MinBox1<ListBox<A>> => {
        if (isListLike(fa)) {
            if ($null(fa as unknown as ListBox<A>)) {
                return base.empty<ListBox<A>>()
            }

            return listSome(fa)
        }

        const build = (n: number): MinBox1<ListBox<A>> =>
            base['<|>'](
                replicate(n, fa),
                defer(() => build(n + 1)),
            )

        return build(1)
    }

    const many = <A>(fa: MinBox1<A>): MinBox1<ListBox<A>> => {
        if (isListLike(fa)) {
            return listMany(fa)
        }

        return base['<|>'](some(fa), applicative.pure(nil()))
    }

    return {
        ...applicative,
        ...base,
        some,
        many,
    }
}

// Expose internals for white-box tests that exercise the lazy wrapper and detection paths.
export const __testing = {
    defer,
    isListLike,
}
