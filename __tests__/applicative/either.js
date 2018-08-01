import { identity, compose, flip, partial } from 'ramda';
import { dot } from '@common/utils';
import { Either } from '@data/either';
import { applicative as appBase } from '@control/applicative/either';

const applicative = appBase();

describe('Either Applicative',() => {
    describe('pure', () => {
        it('returns Right', () => {
            const expected = applicative.pure(3);
            expect(expected.value).toEqual(3);
            expect(expected.isRight).toBe(true);
        });
    });

    describe('lift', () => {
        it('returns for valid args (Right, Right)', () => {
            const arg1 = Either.right((x) => x * 3);
            const arg2 = Either.right(2);
            const result = applicative.lift(arg1, arg2);
            expect(result.value).toEqual(6);
            expect(result.isRight).toBe(true);
        });

        it('uses Right for falsy first arg', () => {
            const result = applicative.lift(undefined, Either.right(2));
            expect(result.isRight).toBe(true);
        });

        it('uses Right for falsy second arg', () => {
            const result = applicative.lift(Either.right((x) => x + 1), undefined);
            expect(result.isRight).toBe(true);
        });

        it('returns Left for (Left, Left)', () => {
            const error1 = new Error('Test 1');
            const result = applicative.lift(Either.left(error1), Either.left(new Error('Test 2')));
            expect(result.isLeft).toBe(true);
            expect(result.value).toBe(error1);
        });

        it('returns Left for (Left, Right)', () => {
            const error1 = new Error('Test 1');
            const result = applicative.lift(Either.left(error1), Either.right('Test'));
            expect(result.isLeft).toBe(true);
            expect(result.value).toBe(error1);
        });

        it('returns Left for (Right, Left)', () => {
            const error1 = new Error('Test 1');
            const result = applicative.lift(Either.right('Test'), Either.left(error1));
            expect(result.isLeft).toBe(true);
            expect(result.value).toBe(error1);
        });
    });

    describe('extensions', () => {
        it('liftA2',() => {
            const f = (a) => (b) => (a + 1) * b;
            const result = applicative.liftA2(f, Either.right(2), Either.right(5));
            expect(result.value).toBe(15);
        });

        it('*>',() => {
            const result = applicative['*>'](Either.right(3), Either.right(6));
            expect(result.value).toBe(6);
        });

        it('<*',() => {
            const result = applicative['<*'](Either.right(3), Either.right(6));
            expect(result.value).toBe(3);
        });

        it('<**>', () => {
            const result = applicative['<**>'](Either.right(5), Either.right((x) => x * 2));
            expect(result.value).toBe(10);
        });

        it('liftA', () => {
            const result = applicative.liftA((x) => x * 2, Either.right(3));
            expect(result.value).toBe(6);
        });

        it('liftA3', () => {
            const f = (a) => (b) => (c) => (a + 1) * (b + 1) * (c + 1);
            const result = applicative.liftA3(f, Either.right(2), Either.right(3), Either.right(5));
            expect(result.value).toBe(72);
        });
    });

    describe('Applicative first law (Identity): pure id <*> v = v', () => {
        it('Right', () => {
            const arg1 = applicative.pure(identity);
            const arg2 = Either.right(3);
            const result = applicative.lift(arg1, arg2);

            expect(result.value).toEqual(arg2.value);
            expect(result.value).toEqual(3);
            expect(result.isRight).toBe(true);
        });

        it('Left', () => {
            const error = new Error('Test');
            const arg1 = applicative.pure(identity);
            const arg2 = Either.left(error);
            const result = applicative.lift(arg1, arg2);

            expect(result.value).toBe(arg2.value);
            expect(result.value).toBe(error);
            expect(result.isLeft).toBe(true);
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
        expect(result2.value).toEqual(10);
        expect(result1.isRight).toBe(true);
        expect(result2.isRight).toBe(true);
    });

    describe('Applicative third law (Interchange): u <*> pure y = pure ($ y) <*> u', () => {
        const y = 7;
        const $y = (f) => f(y); 
        
        it('Right', () => {
            const u = Either.right((x) => x * 3);

            const arg1 = applicative.pure(y);
            const arg2 = applicative.pure($y);

            const result1 = applicative.lift(u, arg1);
            const result2 = applicative.lift(arg2, u);

            expect(result1.value).toEqual(result2.value);
            expect(result1.value).toEqual(21);
            expect(result1.isRight).toBe(true);
            expect(result2.isRight).toBe(true);
        });

        it('Left', () => {
            const error = new Error('Test');
            const u = Either.left(error);

            const arg1 = applicative.pure(y);
            const arg2 = applicative.pure($y);

            const result1 = applicative.lift(u, arg1);
            const result2 = applicative.lift(arg2, u);

            expect(result1.isLeft).toBe(result2.isLeft);
            expect(result1.isLeft).toBe(true);
            expect(result1.value).toBe(error);
            expect(result2.value).toBe(error);
        });
    });

    describe('Application forth law (Composition): pure (.) <*> u <*> v <*> w = u <*> (v <*> w)', () => {
        const u = Either.right((x) => x + 2);
        const v = Either.right((x) => x * 3);
        const arg1 = applicative.pure(dot);
        
        it('Right', () => {
            const w = Either.right(3);

            const result1 = applicative.lift(applicative.lift(applicative.lift(arg1, u), v), w);
            const result2 = applicative.lift(u, applicative.lift(v, w));

            expect(result1.value).toBe(result2.value);
            expect(result1.value).toBe(11);
            expect(result1.isRight).toBe(true);
            expect(result2.isRight).toBe(true);
        });

        it('Left', () => {
            const error = new Error('Test');
            const w = Either.left(error);

            const result1 = applicative.lift(applicative.lift(applicative.lift(arg1, u), v), w);
            const result2 = applicative.lift(u, applicative.lift(v, w));

            expect(result1.isLeft).toBe(result2.isLeft);
            expect(result1.isLeft).toBe(true);
            expect(result1.value).toBe(error);
            expect(result2.value).toBe(error);
        });

         it('with compose', () => {
            const w = Either.right(-5);
            const lift = applicative.lift.bind(applicative);
          
            const result1 = compose(
                flip(lift)(w),
                flip(lift)(v),
                partial(lift, [arg1])
            )(u);

            const result2 = compose(
                partial(lift, [u]),
                partial(lift, [v])
            )(w); 

            expect(result1.value).toBe(result2.value);
            expect(result1.value).toBe(-13);
            expect(result1.isRight).toEqual(result2.isRight);
            expect(result1.isRight).toBe(true);
        });
    });
});
