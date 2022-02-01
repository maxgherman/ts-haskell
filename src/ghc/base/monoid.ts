import { MinBox0 } from 'data/kind'
import type { Semigroup } from 'ghc/base/semigroup'
import { $null, head, List, tail } from 'ghc/base/list/list'

export type MonoidBase<T> = Semigroup<T> & {
    readonly mempty: MinBox0<T>
}

export type Monoid<T> = MonoidBase<T> & {
    '<>'(a: MinBox0<T>, b: MinBox0<T>): MinBox0<T>
    mappend(a: MinBox0<T>, b: MinBox0<T>): MinBox0<T>
    mconcat(_: List<MinBox0<T>>): MinBox0<T>
}

const mappend =
    <T>(semigroup: Semigroup<T>) =>
    (a: MinBox0<T>, b: MinBox0<T>): MinBox0<T> =>
        semigroup['<>'](a, b)

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

export const monoid = <T>(monoidBase: MonoidBase<T>): Monoid<T> => {
    return {
        ...monoidBase,
        mappend: mappend(monoidBase),
        '<>': mappend(monoidBase),
        mconcat: mconcat(monoidBase, monoidBase.mempty),
    }
}
