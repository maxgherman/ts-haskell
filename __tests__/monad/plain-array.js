import { monad } from '@control/monad/plain-array';

describe('PlainArray monad', () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];

    describe('return', () => {
        it('returns array', () => {
            const result = monad.return(1);
            expect(result).toEqual([1]);
        });

        it('returns array for falsy args', () => {
            const result = monad.return(undefined);
            expect(result).toEqual([undefined]);
        });
    });

    describe('>>=', () => {
        it('returns for valid args', () => {
            const result = monad['>>='](a, x => x * x);
            expect(result).toEqual([1, 4, 9]);
        });

        it('uses empty array for falsy first arg', () => {
            const result = monad['>>='](undefined, x => x * x);
            expect(result).toEqual([]);
        });

        it('uses id for falsy second paramter', () => {
            const result = monad['>>='](a, undefined);
            expect(result).toEqual(a);
        });
    });

    describe('>>', () => {
        it('returns for valid args', () => {
            const result = monad['>>'](a, b);
            expect(result).toEqual([4, 5, 6, 4, 5, 6, 4, 5, 6]);
        });

        it('uses empty array for falsy first arg', () => {
            const result = monad['>>'](undefined, b);
            expect(result).toEqual([]);
        });

        it('uses empty array for falsy second arg', () => {
            const result = monad['>>'](a, undefined);
            expect(result).toEqual([]);
        });
    });

    describe('fail', () => {
        it('returns for valid args', () => {
            const result = monad.fail('Test');
            expect(result).toEqual([]);
        });

        it('returns for falsy args', () => {
            const result = monad.fail(undefined);
            expect(result).toEqual([]);
        });
    });
});