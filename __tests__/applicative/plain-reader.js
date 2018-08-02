import { applicative as appBase } from '@control/applicative/plain-reader';

const applicative = appBase();

describe('Reader Applicative',() => {
    describe('pure', () => {
        it('returns always', () => {
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
});