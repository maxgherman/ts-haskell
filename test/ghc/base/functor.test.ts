import tap from 'tap'
import { kindOf, Functor, functor as createFunctor, FunctorBase } from 'ghc/base/functor'
import { Type } from 'data/kind'

tap.test('functor', async () => {
    tap.test('kindOf', async (t) => {
        const kind = kindOf({} as Functor) as (_: (_: '*') => '*') => 'Constraint'
        const result = kind({} as (_: '*') => '*')

        t.equal(result, 'Constraint')
    })

    tap.test('factory + extensions', async (t) => {
        type Box<T> = { value: T; kind: (_: '*') => '*' }

        const box = <T>(x: T): Box<T> => ({ value: x, kind: (_: '*') => '*' as Type })

        const base: FunctorBase = {
            fmap: <A, B>(f: (a: A) => B, fa: Box<A>): Box<B> => box(f(fa.value)) as unknown as Box<B>,
        }

        const F = createFunctor(base)

        const fa = box(3)

        const mapped = F.fmap((x: number) => x + 2, fa) as Box<number>
        t.equal(mapped.value, 5)

        const opL = F['<$']('a', fa) as Box<string>
        t.equal(opL.value, 'a')

        const opR = F['$>'](fa, 'b') as Box<string>
        t.equal(opR.value, 'b')

        const rev = F['<&>'](fa, (x: number) => x * 10) as Box<number>
        t.equal(rev.value, 30)

        const vd = F.void(fa) as Box<[]>
        t.same(vd.value, [])

        t.equal(
            F.kind((_: '*') => '*'),
            'Constraint',
        )
    })
})
