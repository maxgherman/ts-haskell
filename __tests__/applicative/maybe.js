import { dot } from '@common/utils';
import { identity, compose, flip, partial } from 'ramda';
import { Maybe } from '@data/maybe';
import { applicative } from '@control/applicative/maybe';

describe('Maybe Applicative',() => {
    describe('pure', () => {
        it('returns Just', () => {
            const expected = applicative.pure(3);
            expect(expected.value).toEqual(3);
            expect(expected.isJust).toBe(true);
        });
    });

    describe('lift', () => {
        it('returns for valid args (Just, Just)', () => {
            const arg1 = Maybe.just((x) => x * 3);
            const arg2 = Maybe.just(2);
            const result = applicative.lift(arg1, arg2);
            expect(result.value).toEqual(6);
            expect(result.isJust).toBe(true);
        });

        it('uses Nothing for falsy first arg', () => {
            const result = applicative.lift(undefined, Maybe.just(2));
            expect(result.isNothing).toBe(true);
        });

        it('uses Nothing for falsy second arg', () => {
            const result = applicative.lift(Maybe.just((x) => x + 1), undefined);
            expect(result.isNothing).toBe(true);
        });

        it('returns Nothing for left Nothing', () => {
            const result = applicative.lift(Maybe.nothing(), Maybe.just(2));
            expect(result.isNothing).toBe(true);
        });

        it('returns Nothing for Right Nothing', () => {
            const result = applicative.lift(Maybe.just((x) => x + 1), Maybe.nothing());
            expect(result.isNothing).toBe(true);
        });

        it('returns Nothing for both Nothing', () => {
            const result = applicative.lift(Maybe.nothing(), Maybe.nothing());
            expect(result.isNothing).toBe(true);
        });
    });

    describe('extensions', () => {
        it('liftA2',() => {
            const f = (a) => (b) => (a + 1) * b;
            const result = applicative.liftA2(f, Maybe.just(2), Maybe.just(5));

            expect(result.value).toBe(15);
        });

        it('*>',() => {
            const result = applicative['*>'](Maybe.from(3), Maybe.from(6));
            expect(result.value).toBe(6);
        });

        it('<*',() => {
            const result = applicative['<*'](Maybe.from(3), Maybe.from(6));
            expect(result.value).toBe(3);
        });

        it('<**>', () => {
            const result = applicative['<**>'](Maybe.from(5), Maybe.from((x) => x * 2));
            expect(result.value).toBe(10);
        });

        it('liftA', () => {
            const result = applicative.liftA((x) => x * 2, Maybe.from(3));
            expect(result.value).toBe(6);
        });

        it('liftA3', () => {
            const f = (a) => (b) => (c) => (a + 1) * (b + 1) * (c + 1);
            const result = applicative.liftA3(f, Maybe.from(2), Maybe.from(3), Maybe.from(5));
            expect(result.value).toBe(72);
        });
    });

    describe('Applicative first law (Identity): pure id <*> v = v', () => {
        it('Just', () => {
            const arg1 = applicative.pure(identity);
            const arg2 = Maybe.just(3);
            const result = applicative.lift(arg1, arg2);

            expect(result.value).toEqual(arg2.value);
            expect(result.value).toEqual(3);
            expect(result.isJust).toBe(true);
        });

        it('Nothing', () => {
            const arg1 = applicative.pure(identity);
            const arg2 = Maybe.nothing();
            const result = applicative.lift(arg1, arg2);

            expect(result.isNothing).toBe(true);
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
        expect(result1.isJust).toBe(true);
        expect(result2.isJust).toBe(true);
    });

    describe('Applicative third law (Interchange): u <*> pure y = pure ($ y) <*> u', () => {
        const y = 7;
        const $y = (f) => f(y); 
        
        it('Just', () => {
            const u = Maybe.from((x) => x * 3);

            const arg1 = applicative.pure(y);
            const arg2 = applicative.pure($y);

            const result1 = applicative.lift(u, arg1);
            const result2 = applicative.lift(arg2, u);

            expect(result1.value).toEqual(result2.value);
            expect(result1.value).toEqual(21);
            expect(result1.isJust).toBe(true);
            expect(result2.isJust).toBe(true);
        });

        it('Nothing', () => {
            const u = Maybe.nothing();

            const arg1 = applicative.pure(y);
            const arg2 = applicative.pure($y);

            const result1 = applicative.lift(u, arg1);
            const result2 = applicative.lift(arg2, u);

            expect(result1.isNothing).toBe(result2.isNothing);
            expect(result1.isNothing).toBe(true);
        });
    });

    describe('Application forth law (Composition): pure (.) <*> u <*> v <*> w = u <*> (v <*> w)', () => {
        const u = Maybe.just((x) => x + 2);
        const v = Maybe.just((x) => x * 3);
        const arg1 = applicative.pure(dot);
        
        it('Just', () => {
            const w = Maybe.just(3);

            const result1 = applicative.lift(applicative.lift(applicative.lift(arg1, u), v), w);
            const result2 = applicative.lift(u, applicative.lift(v, w));

            expect(result1.value).toBe(result2.value);
            expect(result1.value).toBe(11);
            expect(result1.isJust).toBe(true);
            expect(result2.isJust).toBe(true);
        });

        it('Nothing', () => {
            const w = Maybe.nothing();

            const result1 = applicative.lift(applicative.lift(applicative.lift(arg1, u), v), w);
            const result2 = applicative.lift(u, applicative.lift(v, w));

            expect(result1.isNothing).toBe(result2.isNothing);
            expect(result1.isNothing).toBe(true);
        });

        it('with compose', () => {
            const w = Maybe.from(-5);
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
            expect(result1.value).toBe(-13);
            expect(result1.isJust).toEqual(result2.isJust);
            expect(result1.isJust).toBe(true);
        });
    });
});