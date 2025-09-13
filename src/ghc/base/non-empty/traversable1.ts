import { traversable1 as createTraversable1, Traversable1, BaseImplementation } from 'data/semigroup/traversable'
import { functor } from './functor'
import { foldable1 } from './foldable1'
import { NonEmptyBox, toList, cons as neCons } from './list'
import { Apply } from 'data/functor/apply'
import { MinBox1 } from 'data/kind'
import { nil, ListBox, cons, toArray } from 'ghc/base/list/list'

export interface NonEmptyTraversable1 extends Traversable1 {
    traverse1<A, B>(ap: Apply, f: (a: A) => MinBox1<B>, ta: NonEmptyBox<A>): MinBox1<NonEmptyBox<B>>
    sequence1<A>(ap: Apply, tfa: NonEmptyBox<MinBox1<A>>): MinBox1<NonEmptyBox<A>>
}

// sequence1 for NonEmpty using only Apply:
// Let tfa = a0 :| [a1, a2, ...], effects: MinBox1<A>
// Build MinBox1<(List<A>) => NonEmpty<A>> starting from head and foldr over tail,
// then fmap apply that function to nil to get MinBox1<NonEmpty<A>>
const base: BaseImplementation = {
    sequence1: <A>(ap: Apply, tfa: NonEmptyBox<MinBox1<A>>): MinBox1<NonEmptyBox<A>> => {
        const headA = (tfa as unknown as NonNullable<() => [MinBox1<A>, ListBox<MinBox1<A>>]>)()
        const h: MinBox1<A> = headA[0]
        const tailList: ListBox<MinBox1<A>> = headA[1]

        // g0 :: MinBox1<(List<B>) => NonEmpty<B>>
        const g0 = ap['<$>']((a0: A) => (rest: ListBox<A>) => neCons(a0 as NonNullable<A>)(rest), h)

        const effs = toArray(tailList)

        const g = effs.reduceRight(
            (acc, fx) =>
                ap.liftA2<A, (rest: ListBox<A>) => NonEmptyBox<A>, (rest: ListBox<A>) => NonEmptyBox<A>>(
                    (x: A) => (grest: (rest: ListBox<A>) => NonEmptyBox<A>) => (rest: ListBox<A>) =>
                        grest(cons(x as NonNullable<A>)(rest)),
                    fx,
                    acc,
                ),
            g0 as MinBox1<(rest: ListBox<A>) => NonEmptyBox<A>>,
        )

        return ap['<$>']((fn: (rest: ListBox<A>) => NonEmptyBox<A>) => fn(nil<A>()), g)
    },
}

export const traversable1 = createTraversable1(base, functor, foldable1) as NonEmptyTraversable1
