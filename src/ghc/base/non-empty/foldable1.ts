import { foldable1 as createFoldable1, Foldable1, Foldable1Base } from 'data/semigroup/foldable'
import { head, tail, NonEmptyBox } from './list'
import { toArray as listToArray, ListBox, nil, cons } from 'ghc/base/list/list'
import { Semigroup } from 'ghc/base/semigroup'
import { MinBox0 } from 'data/kind'

export interface NonEmptyFoldable1 extends Foldable1 {
    foldMap1<A, M>(s: Semigroup<M>, f: (a: A) => MinBox0<M>, fa: NonEmptyBox<A>): MinBox0<M>
    fold1<M>(s: Semigroup<M>, fa: NonEmptyBox<M>): MinBox0<M>
}

const base: Foldable1Base = {
    foldMap1: <A, M>(s: Semigroup<M>, f: (a: A) => MinBox0<M>, fa: NonEmptyBox<A>): MinBox0<M> => {
        const h = head(fa)
        const t = tail(fa)
        const arr = listToArray<A>(t as ListBox<A>)
        let acc = f(h)
        for (const x of arr) {
            acc = s['<>'](acc, f(x))
        }
        return acc
    },
}

export const foldable1 = createFoldable1(base) as NonEmptyFoldable1
