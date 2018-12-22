import { compose, partial, flip } from 'ramda';
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
            const result = monad['>>='](a, x => [x * x]);
            expect(result).toEqual([1, 4, 9]);
        });

        it('uses empty array for falsy first arg', () => {
            const result = monad['>>='](undefined, x => [x * x]);
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

    describe('Monad first law (Left identity): return a >>= k = k a', () => {
        const action = (x) => [x * x];
        
        it('direct', () => {
            const result1 = monad['>>='](monad.return(3), action);
            const result2 = action(3);

            expect(result1).toEqual(result2);
            expect(result1).toEqual([9]);
        });

        it('with compose', () => {
            
            const result1 = compose(
                partial(flip(monad['>>=']), [action]),
                () => monad.return(3)
            )();
            
            const result2 = action(3);

            expect(result1).toEqual(result2);
            expect(result1).toEqual([9]);
        });
    });

    describe('Monad second law (Right identity): m >>= return =	m', () => {

        it('direct', () => {
            const result = monad['>>='](a, monad.return); 
            expect(result).toEqual(a);
        });

        it('with compose', () => {

            const result = compose(
                partial(monad['>>='], [a]),
             )(monad.return);
            
            expect(result).toEqual(a);
        })
    });

    describe('Monad third law (Associativity): (m >>= f) >>= g = m >>= (\\x -> f x >>= g)', () => {
        const f = x => [ x, x ];
        const g = x => [ x * x ];

        it('direct', () => {
            const result1 = monad['>>='](monad['>>='](a, f), g);
            const result2 = monad['>>='](a, (x) => monad['>>='](f(x), g));

            expect(result1).toEqual(result2);
            expect(result1).toEqual([1, 1, 4, 4, 9, 9]);
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

            expect(result1).toEqual(result2);
            expect(result1).toEqual([1, 1, 4, 4, 9, 9]);
        });
    });

    describe('Monad - Applicative first relationship: pure = return', () => {

        it('for non empty array', () => {
            expect(monad.return(5)).toEqual(monad.pure(5));
            expect(monad.pure(5)).toEqual([5]);
        });
    });
});
