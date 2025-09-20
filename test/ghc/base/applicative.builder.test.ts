import tap from 'tap'
import { applicative as createApplicative } from 'ghc/base/applicative'
import { functor as listFunctor } from 'ghc/base/list/functor'
import { cons, nil, head, ListBox } from 'ghc/base/list/list'
import { comp } from 'ghc/base/list/comprehension'

tap.test('Applicative builder (derive missing pieces)', async (t) => {
    t.test('derive liftA2 from <*>', async (t) => {
        const base = {
            pure: <A>(a: NonNullable<A>) => cons(a)(nil<NonNullable<A>>()),
            '<*>': <A, B>(f: ListBox<(_: A) => B>, fa: ListBox<A>): ListBox<B> => comp((fn, a) => fn(a), [f, fa]),
        }
        const App = createApplicative(base, listFunctor)

        const fa = cons<number>(2)(nil<number>())
        const fb = cons<number>(3)(nil<number>())
        const sum2 = (x: number) => (y: number) => x + y

        // uses provided <*> and derived liftA2
        const r1 = App['<*>'](cons<(x: number) => number>((x) => x + 5)(nil()), fa) as ListBox<number>
        t.equal(head(r1), 7)

        const r2 = App.liftA2(sum2, fa, fb) as ListBox<number>
        t.equal(head(r2), 5)

        // extensions
        t.equal(head(App['*>'](fa, fb) as ListBox<number>), 3)
        t.equal(head(App['<*'](fa, fb) as ListBox<number>), 2)
        t.equal(head(App['<**>'](fa, cons<(n: number) => number>((n) => n * 10)(nil())) as ListBox<number>), 20)
    })

    t.test('derive <*> from liftA2', async (t) => {
        const base = {
            pure: <A>(a: NonNullable<A>) => cons(a)(nil<NonNullable<A>>()),
            liftA2: <A, B, C>(f: (_: A) => (_: B) => C, fa: ListBox<A>, fb: ListBox<B>): ListBox<C> =>
                comp((a, b) => f(a)(b), [fa, fb]),
        }
        const App = createApplicative(base, listFunctor)

        const fa = cons<number>(4)(nil<number>())
        const r1 = App['<*>'](cons<(x: number) => number>((x) => x - 1)(nil()), fa) as ListBox<number>
        t.equal(head(r1), 3)
    })
})
