import { compose, partial, flip } from 'ramda';
import { monad } from '@control/monad/boxed-array';
import { BoxedArray } from '@data/boxed-array';

describe('PlainArray monad', () => {
    const a = BoxedArray.from([1, 2, 3]);
    const b = BoxedArray.from([4, 5, 6]);
    const f = x => BoxedArray.from([ x, x ]);
    const g = x => BoxedArray.from([ x * x ]);

    describe('return', () => {
        it('returns array', () => {
            const result = monad.return(1);
            expect(result.value).toEqual([1]);
        });

        it('returns array for falsy args', () => {
            const result = monad.return(undefined);
            expect(result.value).toEqual([]);
        });
    });

    describe('>>=', () => {
        it('returns for valid args', () => {
            const result = monad['>>='](a, g);
            expect(result.value).toEqual([1, 4, 9]);
        });

        it('uses empty array for falsy first arg', () => {
            const result = monad['>>='](undefined, g);
            expect(result.value).toEqual([]);
        });

        it('uses empty array for falsy second paramter', () => {
            const result = monad['>>='](a, undefined);
            expect(result.value).toEqual([]);
        });
    });

    describe('>>', () => {
        it('returns for valid args', () => {
            const result = monad['>>'](a, b);
            expect(result.value).toEqual([4, 5, 6, 4, 5, 6, 4, 5, 6]);
        });

        it('uses empty array for falsy first arg', () => {
            const result = monad['>>'](undefined, b);
            expect(result.value).toEqual([]);
        });

        it('uses empty array for falsy second arg', () => {
            const result = monad['>>'](a, undefined);
            expect(result.value).toEqual([]);
        });
    });

    describe('fail', () => {
        it('returns for valid args', () => {
            const result = monad.fail('Test');
            expect(result.value).toEqual([]);
        });

        it('returns for falsy args', () => {
            const result = monad.fail(undefined);
            expect(result.value).toEqual([]);
        });
    });

    describe('Monad first law (Left identity): return a >>= k = k a', () => {
        it('direct', () => {
            const result1 = monad['>>='](monad.return(3), g);
            const result2 = g(3);

            expect(result1.value).toEqual(result2.value);
            expect(result1.value).toEqual([9]);
        });

        it('with compose', () => {
            
            const result1 = compose(
                partial(flip(monad['>>=']), [g]),
                () => monad.return(3)
            )();
            
            const result2 = g(3);

            expect(result1.value).toEqual(result2.value);
            expect(result1.value).toEqual([9]);
        });
    });

    describe('Monad second law (Right identity): m >>= return =	m', () => {

        it('direct', () => {
            const result = monad['>>='](a, monad.return); 
            expect(result.value).toEqual(a.value);
        });

        it('with compose', () => {

            const result = compose(
                partial(monad['>>='], [a]),
             )(monad.return);
            
            expect(result.value).toEqual(a.value);
        });
    });

    describe('Monad third law (Associativity): (m >>= f) >>= g = m >>= (\\x -> f x >>= g)', () => {
        it('direct', () => {
            const result1 = monad['>>='](monad['>>='](a, f), g);
            const result2 = monad['>>='](a, (x) => monad['>>='](f(x), g));

            expect(result1.value).toEqual(result2.value);
            expect(result1.value).toEqual([1, 1, 4, 4, 9, 9]);
        });

        it('with compose', () => {

            const result1 = compose(
                partial(flip(monad['>>=']), [g]),
                partial(monad['>>='], [a]),
            )(f);

            const result2 = compose(
                partial(monad['>>='], [a]),
                prev => x => prev(f(x)),
                partial(flip(monad['>>=']), [g])     
            )();

            expect(result1.value).toEqual(result2.value);
            expect(result1.value).toEqual([1, 1, 4, 4, 9, 9]);
        });
    });

    describe('Monad - Applicative first relationship: pure = return', () => {

        it('for non empty array', () => {
            expect(monad.return(5).value).toEqual(monad.pure(5).value);
            expect(monad.pure(5).value).toEqual([5]);
        });

        it('for empty array', () => {
            expect(monad.return(null).value).toEqual(monad.pure(null).value);
        });
    });
});