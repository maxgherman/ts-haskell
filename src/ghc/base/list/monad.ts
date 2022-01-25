// instance Monad [] -- Defined in ‘GHC.Base’

import { MinBox1, Type } from 'data/kind'
import { ListBox, nil, head, $null, tail } from 'ghc/base/list/list'
import { MonadBase, Monad, monad as createMonad } from 'ghc/base/monad/monad'
import { applicative } from 'ghc/base/list/applicative'
import { FunctionArrow, FunctionArrow2 } from 'ghc/prim/function-arrow'

export interface ListMonad extends Omit<Monad, '>>=' | '>>'> {
    '>>=': <A, B>(ma: ListBox<A>, f: FunctionArrow<A, ListBox<B>>) => ListBox<B>

    '>>': <A, B>(ma: ListBox<A>, mb: ListBox<B>) => ListBox<B>

    return: <A>(a: NonNullable<A>) => ListBox<A>

    pure<A>(a: NonNullable<A>): ListBox<A>

    '<*>'<A, B>(f: ListBox<FunctionArrow<A, B>>, fa: ListBox<A>): ListBox<B>

    liftA2<A, B, C>(f: FunctionArrow2<A, B, C>, fa: ListBox<A>, fb: ListBox<B>): ListBox<C>

    '*>'<A, B>(fa: ListBox<A>, fb: ListBox<B>): ListBox<B>

    '<*'<A, B>(fa: ListBox<A>, fb: ListBox<B>): ListBox<A>

    '<**>'<A, B>(fa: ListBox<A>, f: ListBox<FunctionArrow<A, B>>): ListBox<B>

    fmap<A, B>(f: (a: A) => B, fa: ListBox<A>): ListBox<B>

    '<$>'<A, B>(f: (a: A) => B, fa: ListBox<A>): ListBox<B>

    '<$'<A, B>(a: A, fb: ListBox<B>): ListBox<A>

    '$>'<A, B>(fa: ListBox<A>, b: B): ListBox<B>

    '<&>'<A, B>(fa: ListBox<A>, f: (a: A) => B): ListBox<B>

    void<A>(fa: ListBox<A>): ListBox<[]>
}

type ListMonadBase = MonadBase & {
    '>>=': <A, B>(ma: ListBox<A>, f: FunctionArrow<A, ListBox<B>>) => ListBox<B>
}

const baseImplementation: ListMonadBase = {
    ...applicative,

    // xs >>= f = [y | x <- xs, y <- f x]
    '>>=': <A, B>(ma: MinBox1<A>, f: FunctionArrow<A, MinBox1<B>>): ListBox<B> => {
        const p1 = ma as ListBox<A>
        const p2 = f as FunctionArrow<A, ListBox<B>>

        const computation = (innerList: ListBox<B>, ma: ListBox<A>, f: FunctionArrow<A, ListBox<B>>): ListBox<B> => {
            if (!$null(innerList)) {
                const result = () => ({
                    head: head(innerList),
                    tail: computation(tail(innerList), ma, f),
                })

                result.kind = (_: '*') => '*' as Type
                return result
            }

            if ($null(ma)) {
                return nil<B>()
            }

            const next = f(head(ma))
            return computation(next, tail(ma), f)
        }

        return computation(nil<B>(), p1, p2)
    },
}

export const monad = createMonad(baseImplementation, applicative) as Omit<Monad, '>>=' | '>>'> as ListMonad

// (>>) = (*>)
monad['>>'] = monad['*>']
