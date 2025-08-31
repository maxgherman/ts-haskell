import tap from 'tap'
import { apply as createApply, toApplicative, fromApplicative } from 'data/functor/apply'
import { dot } from 'ghc/base/functions'
import { functor as listFunctor } from 'ghc/base/list/functor'
import { applicative as listApplicative } from 'ghc/base/list/applicative'
import { cons, nil, head, ListBox } from 'ghc/base/list/list'
import { comp } from 'ghc/base/list/comprehension'

tap.test('Apply (factory + laws)', async (t) => {
    t.test('derive liftA2 from <*>', async (t) => {
        const base = {
            '<*>': <A, B>(f: ListBox<(_: A) => B>, fa: ListBox<A>): ListBox<B> => comp((fn, a) => fn(a), [f, fa]),
        }
        const A = createApply(base, listFunctor)

        const fa = cons<number>(2)(nil<number>())
        const fb = cons<number>(3)(nil<number>())
        const sum2 = (x: number) => (y: number) => x + y

        const r1 = A['<*>'](cons<(x: number) => number>((x) => x + 5)(nil()), fa) as ListBox<number>
        t.equal(head(r1), 7)

        const r2 = A.liftA2(sum2, fa, fb) as ListBox<number>
        t.equal(head(r2), 5)

        const rThen = A['*>'](fa, fb) as ListBox<number>
        t.equal(head(rThen), 3)

        const rLeft = A['<*'](fa, fb) as ListBox<number>
        t.equal(head(rLeft), 2)

        const rFlip = A['<**>'](fa, cons<(x: number) => number>((x) => x * 10)(nil())) as ListBox<number>
        t.equal(head(rFlip), 20)
    })

    t.test('derive <*> from liftA2', async (t) => {
        const base = {
            liftA2: <A, B, C>(f: (_: A) => (_: B) => C, fa: ListBox<A>, fb: ListBox<B>): ListBox<C> =>
                comp((a, b) => f(a)(b), [fa, fb]),
        }
        const A = createApply(base, listFunctor)

        const fa = cons<number>(4)(nil<number>())
        const r1 = A['<*>'](cons<(x: number) => number>((x) => x - 1)(nil()), fa) as ListBox<number>
        t.equal(head(r1), 3)
    })

    t.test('Apply associativity (composition) law', async (t) => {
        const base = {
            '<*>': <A, B>(f: ListBox<(_: A) => B>, fa: ListBox<A>): ListBox<B> => comp((fn, a) => fn(a), [f, fa]),
        }
        const A = createApply(base, listFunctor)

        // u :: f (b -> c), v :: f (a -> b), w :: f a
        const u = cons<(b: number) => number>((y) => y + 10)(nil())
        const v = cons<(a: number) => number>((x) => x * 2)(nil())
        const w = cons<number>(3)(nil<number>())

        const left = A['<*>'](
            A['<*>'](listFunctor['<$>'](dot as unknown as (g: (_: number) => number) => (_: number) => number, u), v),
            w,
        ) as ListBox<number>
        const right = A['<*>'](u, A['<*>'](v, w)) as ListBox<number>

        t.equal(head(left), head(right))
        t.equal(head(right), 16)
    })

    t.test('toApplicative (Apply + pure) yields Applicative', async (t) => {
        const base = {
            '<*>': <A, B>(f: ListBox<(_: A) => B>, fa: ListBox<A>): ListBox<B> => comp((fn, a) => fn(a), [f, fa]),
        }
        const A = createApply(base, listFunctor)
        const pure = <A>(a: NonNullable<A>) => cons<NonNullable<A>>(a)(nil<NonNullable<A>>())
        const App = toApplicative(A, pure)

        const v = cons<number>(7)(nil<number>())
        const pureId = App.pure((x: number) => x)
        const result = App['<*>'](pureId, v) as ListBox<number>

        t.equal(head(result), 7)
    })

    t.test('fromApplicative (drops pure) yields Apply', async (t) => {
        const App = listApplicative
        const Ap = fromApplicative(App)

        const fa = cons<number>(2)(nil<number>())
        const fb = cons<number>(5)(nil<number>())
        const plus1 = cons<(x: number) => number>((x) => x + 1)(nil())

        const r1 = Ap['<*>'](plus1, fa) as ListBox<number>
        t.equal(head(r1), 3)

        const r2 = Ap.liftA2((x: number) => (y: number) => x + y, fa, fb) as ListBox<number>
        t.equal(head(r2), 7)
    })
})
