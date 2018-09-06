import { identity, compose, flip, partial } from 'ramda';
import { dot } from '@common/utils';
import { applicative as appBase } from '@control/applicative/plain-reader';

const applicative = appBase();

describe('Plain Reader Applicative',() => {
    describe('pure', () => {
        it('returns Reader', () => {
            const expected = applicative.pure(3);
            expect(expected(10)).toBe(3);
        });
    });

    describe('lift', () => {
        it('returns for valid args', () => {
            // const arg1 = (r) => (x) => r * 3 + x;
            const arg1 = applicative.fmap((x) => (y) => x + y, (x) => x * 3);
            const arg2 = (x) => x + 1;
            const result = applicative.lift(arg1, arg2);
            expect(result(10)).toBe(41);
        });

        it('uses identity for falsy first arg', () => {
            const result = applicative.lift(undefined, (x) => x + 1);
            expect(result(10)).toBe(11);
        });

        it('uses identity for falsy second arg', () => {
            const result = applicative.lift((r) => (x) => r + x + 1, undefined);
            expect(result(10)).toBe(21);
        });
    });

    describe('extensions', () => {
        it('liftA2',() => {
            const f = (a) => (b) => (a + 1) * b;
            const result = applicative.liftA2(f, (x) => x + 1, (x) => x * 2);
            
            // ((x+1)+1)*b => ((x+1)+1)*(x*2) => 3 => 5*3*2 => 30
            expect(result(3)).toBe(30);
        });

        it('*>',() => {
            const result = applicative['*>']((x) => x * 10, (x) => x - 1);
            expect(result(10)).toBe(9);
        });

        it('<*',() => {
            const result = applicative['<*']((x) => x * 10, (x) => x - 1);
            expect(result(10)).toBe(100);
        });

        it('<**>', () => {
            const result = applicative['<**>']((x) => x + 5, (r)=> (x) => r + x);
            expect(result(3)).toBe(11);
        });

        it('liftA', () => {
            const result = applicative.liftA((x) => x * 2, (x) => x * 3);
            expect(result(10)).toBe(60);
        });

        it('liftA3', () => {
            const f = (a) => (b) => (c) => (a + 1) * (b + 1) * (c + 1);
            const result = applicative.liftA3(f, (x) => x + 2, (x) => x + 3, (x) => x + 5);
            expect(result(1)).toBe(4*5*7);
        });
    });

    describe('Applicative first law (Identity): pure id <*> v = v', () => {
        const arg1 = applicative.pure(identity);
        const arg2 = (r) => r + 3;
        const result = applicative.lift(arg1, arg2);

        expect(result(10)).toBe(arg2(10));
        expect(result(10)).toBe(13);
    });

    describe('Applicative second law (Homomorphism): pure f <*> pure x = pure (f x)', () => {
        const f = (a) => a + 3;
        const x = 7;
        const arg1 = applicative.pure(f);
        const arg2 = applicative.pure(x);

        const result1 = applicative.lift(arg1, arg2);
        const result2 = applicative.pure(f(x));

        expect(result1(10)).toBe(result2(10));
        expect(result2(10)).toBe(10);
    });

    describe('Applicative third law (Interchange): u <*> pure y = pure ($ y) <*> u', () => {
        const y = 7;
        const $y = (f) => f(y); 
        
        const u = (r) => (x) => x + 1;

        const arg1 = applicative.pure(y);
        const arg2 = applicative.pure($y);

        const result1 = applicative.lift(u, arg1);
        const result2 = applicative.lift(arg2, u);

        expect(result1(10)).toBe(result2(10));
        expect(result1(10)).toBe(8);
    });

    describe('Application forth law (Composition): pure (.) <*> u <*> v <*> w = u <*> (v <*> w)', () => {
        const u = (r) => (x) => x + 2;
        const v = (r) => (x) => x * 3;
        const arg1 = applicative.pure(dot);
        
        it('plain', () => {
            const w = (r) => r + 3;
        
            const result1 = applicative.lift(applicative.lift(applicative.lift(arg1, u), v), w);
            const result2 = applicative.lift(u, applicative.lift(v, w));

            expect(result1(1)).toBe(result2(1));
            expect(result1(1)).toBe(14);
        });
       
        it('with compose', () => {
            const w = (r) => r + 6;
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

            expect(result1(1)).toBe(result2(1));
            expect(result1(1)).toBe(23);
        });
    });
});