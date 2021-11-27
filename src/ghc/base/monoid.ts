import { MinBox0 } from 'data/kind'
import type { Semigroup } from 'ghc/base/semigroup'
import { $null, head, List, tail } from 'ghc/base/list/list'

export type MonoidBase<T> = Semigroup<T> & {
    readonly mempty: MinBox0<T>
}

export type Monoid<T> = MonoidBase<T> & {
    '<>'(a: T, b: T): MinBox0<T>
    mappend(a: T, b: T): MinBox0<T>
    mconcat: (_: List<T>) => MinBox0<T>
}

const mappend =
    <T>(semigroup: Semigroup<T>) =>
    (a: T, b: T): MinBox0<T> =>
        semigroup['<>'](a as T & MinBox0<T>, b as T & MinBox0<T>)

// mconcat = foldr '(<>)' mempty
const mconcat =
    <T extends MinBox0<T>>(semigroup: Semigroup<T>, mempty: T) =>
    (list: List<T>): MinBox0<T> => {
        const foldr = (f: (a: T, b: T) => T, list: List<T>): T => {
            if ($null(list)) {
                return mempty
            }

            return f(head(list), foldr(f, tail(list)))
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        return foldr(semigroup['<>'], list)
    }

export const monoid = <T>(monoidBase: MonoidBase<T>) => {
    return {
        ...monoidBase,
        mappend: mappend(monoidBase),
        '<>': mappend(monoidBase),
        mconcat: mconcat(monoidBase, monoidBase.mempty),
    }
}
