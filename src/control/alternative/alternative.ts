import { MinBox1 } from 'data/kind'
import { Applicative } from 'ghc/base/applicative'
import { ListBox, cons, nil, $null } from 'ghc/base/list/list'

/* c8 ignore start */

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
        if ($null(fa as unknown as ListBox<A>)) {
            return base.empty<ListBox<A>>()
        }

        const build = (n: number): MinBox1<ListBox<A>> => base['<|>'](replicate(n, fa), build(n + 1))

        return build(1)
    }

    const many = <A>(fa: MinBox1<A>): MinBox1<ListBox<A>> => base['<|>'](some(fa), applicative.pure(nil()))

    return {
        ...applicative,
        ...base,
        some,
        many,
    }
}

/* c8 ignore stop */
