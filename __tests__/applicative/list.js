import { dot } from '@common/utils';
import { identity, compose, flip, partial } from 'ramda';
import { List } from '@data/list';
import { applicative } from '@control/applicative/list';

describe('List applicative', () => {
    const a = List.empty()[':'](3)[':'](2)[':'](1);
    const b = List.empty()[':'](6)[':'](5)[':'](4);

    describe('pure', () => {
        it('returns list', () => {
            const expected = applicative.pure(3);
            expect(expected.toArray()).toEqual([3]);
        });

        it('returns empty list for falsy arg', () => {
            const expected = applicative.pure(undefined);
            expect(expected.isEmpty).toBe(true);
        });
    });

    describe('lift', () => {
        it('returns for valid args', () => {
            const arg = List.single((x) => x + 2)[':']((x) => x * 3);
            const result = applicative.lift(arg, a);
            expect(result.toArray()).toEqual([3, 6, 9, 3, 4, 5]);
        });

        it('returns uses empty list for falsy first arg', () => {
            const result = applicative.lift(undefined, a);
            expect(result.toArray()).toEqual([]);
        });

        it('returns uses empty list for falsy second arg', () => {
            const result = applicative.lift(List.single((x) => x + 1), undefined);
            expect(result.toArray()).toEqual([]);
        });
    });

    describe('extensions', () => {
        it('liftA2',() => {
            const f = (a) => (b) => (a + 1) * b;
            const result = applicative.liftA2(f, List.single(2)[':'](1), List.single(5)[':'](4));

            expect(result.toArray()).toEqual([8, 10, 12, 15]);
        });

        it('*>',() => {
            const result = applicative['*>'](a, b);
            expect(result.toArray()).toEqual([4, 5, 6, 4, 5, 6, 4, 5, 6]);
        });

        it('<*',() => {
            const result = applicative['<*'](a, b);
            expect(result.toArray()).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3]);
        });

        it('<**>', () => {
            const result = applicative['<**>'](List.single(5)[':'](4), List.single((x) => x * 3)[':']((x) => x * 2));
            expect(result.toArray()).toEqual([8, 12, 10, 15]);
        });

        it('liftA', () => {
            const result = applicative.liftA((x) => x * 2, a);
            expect(result.toArray()).toEqual([2, 4, 6]);
        });

        it('liftA3', () => {
            const f = (a) => (b) => (c) => (a + 1) * (b + 1) * (c + 1);
            const result = applicative.liftA3(f, List.single(2)[':'](1), List.single(3), List.single(5));
            expect(result.toArray()).toEqual([48, 72]);
        });
    });

    describe('Applicative first law (Identity): pure id <*> v = v', () => {
        it('non empty list', () => {
            const arg1 = applicative.pure(identity);
            const result = applicative.lift(arg1, a);

            expect(result.toArray()).toEqual(a.toArray());
            expect(result.toArray()).toEqual([1, 2, 3]);
        });

        it('empty list', () => {
            const arg1 = applicative.pure(identity);
            const arg2 = List.empty();
            const result = applicative.lift(arg1, arg2);

            expect(result.toArray()).toEqual(arg2.toArray());
            expect(result.toArray()).toEqual([]);
        });
    });

    describe('Applicative second law (Homomorphism): pure f <*> pure x = pure (f x)', () => {
        const f = x => x + 3;
        const x = 7;
        const arg1 = applicative.pure(f);
        const arg2 = applicative.pure(x);

        const result1 = applicative.lift(arg1, arg2);
        const result2 = applicative.pure(f(x));

        expect(result1.toArray()).toEqual(result2.toArray());
        expect(result2.toArray()).toEqual([10]);
    });

    describe('Applicative third law (Interchange): u <*> pure y = pure ($ y) <*> u', () => {
        const y = 7;
        const $y = (f) => f(y); 
        
        it('non empty list', () => {
            const u = List.single((x) => x * 3)[':']((x) => x + 1);

            const arg1 = applicative.pure(y);
            const arg2 = applicative.pure($y);

            const result1 = applicative.lift(u, arg1);
            const result2 = applicative.lift(arg2, u);

            expect(result1.toArray()).toEqual(result2.toArray());
            expect(result1.toArray()).toEqual([8, 21])
        });

        it('empty list', () => {
            const u = List.empty();

            const arg1 = applicative.pure(y);
            const arg2 = applicative.pure($y);

            const result1 = applicative.lift(u, arg1);
            const result2 = applicative.lift(arg2, u);

            expect(result1.toArray()).toEqual(result2.toArray());
            expect(result1.toArray()).toEqual([])
        });
    });

    describe('Application forth law (Composition): pure (.) <*> u <*> v <*> w = u <*> (v <*> w)', () => {
        const u = List.single((x) => x + 2);
        const v = List.single((x) => x * 3);
        const arg1 = applicative.pure(dot);
        
        it('non empty list', () => {
            const w = a;

            const result1 = applicative.lift(applicative.lift(applicative.lift(arg1, u), v), w);
            const result2 = applicative.lift(u, applicative.lift(v, w));

            expect(result1.toArray()).toEqual(result2.toArray());
            expect(result1.toArray()).toEqual([5, 8, 11])
        });

        it('empty list', () => {
            const w = List.empty();

            const result1 = applicative.lift(applicative.lift(applicative.lift(arg1, u), v), w);
            const result2 = applicative.lift(u, applicative.lift(v, w));

            expect(result1.toArray()).toEqual(result2.toArray());
            expect(result1.toArray()).toEqual([])
        });

        it('with compose', () => {
            const w = List.single(6)[':'](-5)[':'](4);
            const lift = applicative.lift;
          
            const result1 = compose(
                flip(lift)(w),
                flip(lift)(v),
                partial(lift, [arg1])
            )(u);

            const result2 = compose(
                partial(lift, [u]),
                partial(lift, [v])
            )(w); 

            expect(result1.toArray()).toEqual(result2.toArray());
            expect(result1.toArray()).toEqual([14, -13, 20]);
        });
    });
});