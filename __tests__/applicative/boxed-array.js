import { dot } from '@common/utils';
import { identity, compose, flip, partial } from 'ramda';
import { BoxedArray } from '@data/boxed-array';
import { applicative } from '@control/applicative/boxed-array';

describe('BoxedArray Applicative',() => {
    describe('pure', () => {
        it('returns boxed array', () => {
            const expected = applicative.pure(3);
            expect(expected.value).toEqual([3]);
        });

        it('returns empty boxed array for falsy args', () => {
            const expected = applicative.pure(null);
            expect(expected.value).toEqual([]);
        });
    });

    describe('lift', () => {
        it('returns for valid args', () => {
            const arg1 = BoxedArray.from([(x) => x * 3, (x) => x + 2]);
            const arg2 = BoxedArray.from([1, 2, 3]);
            const result = applicative.lift(arg1, arg2);
            expect(result.value).toEqual([3, 6, 9, 3, 4, 5]);
        });

        it('returns uses empty array for falsy first arg', () => {
            const result = applicative.lift(undefined, BoxedArray.from([1, 2, 3]));
            expect(result.value).toEqual([]);
        });

        it('returns uses empty array for falsy second arg', () => {
            const result = applicative.lift(BoxedArray.from([(x) => x + 1]), undefined);
            expect(result.value).toEqual([]);
        });
    });

    describe('extensions', () => {
        it('liftA2',() => {
            const f = (a) => (b) => (a + 1) * b;
            const result = applicative.liftA2(f, BoxedArray.from([1, 2]), BoxedArray.from([4, 5]));

            expect(result.value).toEqual([8, 10, 12, 15]);
        });

        it('*>',() => {
            const result = applicative['*>'](BoxedArray.from([1, 2, 3]), BoxedArray.from([4, 5, 6]));
            expect(result.value).toEqual([4, 5, 6, 4, 5, 6, 4, 5, 6]);
        });

        it('<*',() => {
            const result = applicative['<*'](BoxedArray.from([1, 2, 3]), BoxedArray.from([4, 5, 6]));
            expect(result.value).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3]);
        });

        it('<**>', () => {
            const result = applicative['<**>'](BoxedArray.from([4, 5]), BoxedArray.from([(x) => x * 2, (x) => x * 3]));
            expect(result.value).toEqual([8,12,10,15]);
        });

        it('liftA', () => {
            const result = applicative.liftA((x) => x * 2, BoxedArray.from([1, 2 , 3]));
            expect(result.value).toEqual([2, 4, 6]);
        });

        it('liftA3', () => {
            const f = (a) => (b) => (c) => (a + 1) * (b + 1) * (c + 1);
            const result = applicative.liftA3(f, BoxedArray.from([1, 2]), BoxedArray.from([3]), BoxedArray.from([5]));
            expect(result.value).toEqual([48, 72]);
        });
    });

    describe('Applicative first law (Identity): pure id <*> v = v', () => {
        it('non empty array', () => {
            const arg1 = applicative.pure(identity);
            const arg2 = BoxedArray.from([1, 2, 3]);
            const result = applicative.lift(arg1, arg2);

            expect(result).toEqual(arg2);
            expect(result.value).toEqual([1, 2, 3]);
        });

        it('empty array', () => {
            const arg1 = applicative.pure(identity);
            const arg2 = BoxedArray.from([]);
            const result = applicative.lift(arg1, arg2);

            expect(result).toEqual(arg2);
            expect(result.value).toEqual([]);
        });
    });

    describe('Applicative second law (Homomorphism): pure f <*> pure x = pure (f x)', () => {
        const f = x => x + 3;
        const x = 7;
        const arg1 = applicative.pure(f);
        const arg2 = applicative.pure(x);

        const result1 = applicative.lift(arg1, arg2);
        const result2 = applicative.pure(f(x));

        expect(result1.value).toEqual(result2.value);
        expect(result2.value).toEqual([10]);
    });

    describe('Applicative third law (Interchange): u <*> pure y = pure ($ y) <*> u', () => {
        const y = 7;
        const $y = (f) => f(y); 
        
        it('non empty array', () => {
            const u = BoxedArray.from([(x) => x + 1, (x) => x * 3]);

            const arg1 = applicative.pure(y);
            const arg2 = applicative.pure($y);

            const result1 = applicative.lift(u, arg1);
            const result2 = applicative.lift(arg2, u);

            expect(result1.value).toEqual(result2.value);
            expect(result1.value).toEqual([8, 21])
        });

        it('empty array', () => {
            const u = BoxedArray.from([]);

            const arg1 = applicative.pure(y);
            const arg2 = applicative.pure($y);

            const result1 = applicative.lift(u, arg1);
            const result2 = applicative.lift(arg2, u);

            expect(result1.value).toEqual(result2.value);
            expect(result1.value).toEqual([])
        });
    });

    describe('Application forth law (Composition): pure (.) <*> u <*> v <*> w = u <*> (v <*> w)', () => {
        const u = BoxedArray.from([(x) => x + 2]);
        const v = BoxedArray.from([(x) => x * 3]);
        const arg1 = applicative.pure(dot);
        
        it('non empty array', () => {
            const w = BoxedArray.from([1, 2, 3]);

            const result1 = applicative.lift(applicative.lift(applicative.lift(arg1, u), v), w);
            const result2 = applicative.lift(u, applicative.lift(v, w));

            expect(result1.value).toEqual(result2.value);
            expect(result1.value).toEqual([5, 8, 11])
        });

        it('empty array', () => {
            const w = BoxedArray.from([]);

            const result1 = applicative.lift(applicative.lift(applicative.lift(arg1, u), v), w);
            const result2 = applicative.lift(u, applicative.lift(v, w));

            expect(result1.value).toEqual(result2.value);
            expect(result1.value).toEqual([])
        });

        it('with compose', () => {
            const w = BoxedArray.from([4, -5, 6]);
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

            expect(result1.value).toEqual(result2.value);
            expect(result1.value).toEqual([14, -13, 20]);
        });
    });
});
