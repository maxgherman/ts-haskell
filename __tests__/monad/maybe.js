import { compose, flip, partial } from 'ramda';
import { Maybe } from '@data/maybe';
import { monad } from '@control/monad/maybe';
import { doSingle } from '@control/common/monad';

describe('Maybe monad', () => {
    const a = Maybe.from(3);
    const b = Maybe.from(5);
    const f = x => Maybe.from(x + x);
    const g = x => Maybe.from(x * x);

    describe('return', () => {
        it('returns Just', () => {
            const result = monad.return(123);
            expect(result.isJust).toBe(true);
            expect(result.value).toBe(123);
        });

        it('returns Nothing for falsy arg', () => {
            const result = monad.return(undefined);
            expect(result.isNothing).toBe(true);
            expect(result.value).toBe(undefined);
        });
    });

    describe('>>=', () => {
        it('returns for valid args', () => {
            const result = monad['>>='](a, g);
            expect(result.value).toBe(3 * 3);
        });

        it('uses Nothing for falsy first arg', () => {
            const result = monad['>>='](undefined, g);
            expect(result.isNothing).toBe(true);
        });

        it('uses Nothing for falsy second arg', () => {
            const result = monad['>>='](a, undefined);
            expect(result.isNothing).toBe(true);
        });
    });

    describe('>>', () => {
        it('returns for valid args', () => {
            const result = monad['>>'](a, b);
            expect(result.value).toEqual(5);
        });

        it('uses Nothing for falsy first arg', () => {
            const result = monad['>>'](undefined, b);
            expect(result.isNothing).toBe(true);
        });

        it('uses Nothing for falsy second arg', () => {
            const result = monad['>>'](a, undefined);
            expect(result.isNothing).toBe(true);
        });
    });

    describe('fail', () => {
        it('returns for valid args', () => {
            const result = monad.fail('Test');
            expect(result.isNothing).toBe(true);
        });

        it('returns for falsy args', () => {
            const result = monad.fail(undefined);
            expect(result.isNothing).toBe(true);
        });
    });

    describe('Monad first law (Left identity): return a >>= k = k a', () => {
        it('direct', () => {
            const result1 = monad['>>='](monad.return(3), g);
            const result2 = g(3);

            expect(result1.value).toBe(result2.value);
            expect(result1.value).toEqual(9);
        });

        it('with compose', () => {
            
            const result1 = compose(
                partial(flip(monad['>>=']), [g]),
                () => monad.return(3)
            )();
            
            const result2 = g(3);

            expect(result1.value).toBe(result2.value);
            expect(result1.value).toEqual(9);
        });
    });

    describe('Monad second law (Right identity): m >>= return =	m', () => {

        it('direct', () => {
            const result = monad['>>='](a, monad.return); 
            expect(result.value).toBe(a.value);
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
            expect(result1.value).toBe((3+3) * (3+3));
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
            expect(result1.value).toBe((3+3) * (3+3));
        });
    });

    describe('Monad - Applicative first relationship: pure = return', () => {

        it('for Just', () => {
            expect(monad.return(5).value).toBe(monad.pure(5).value);
            expect(monad.pure(5).value).toBe(5);
        });
    });

    describe('do - notation', () => {
        const run = (x) => Maybe.from(x*x);
        const start = 5;

        it('returns', () => {
            const test = function*() {
                const value1 = yield monad.return(start);
                return run(value1);
            };

            const result = doSingle(test, monad);

            expect(result.isJust).toBe(true);
            expect(result.value).toBe(25);
        });

        it('returns as yield', () => {
            const test = function*() {
                const value1 = yield monad.return(start);
                const value2 = yield run(value1);

                return value2;
            };

            const result = doSingle(test, monad);

            expect(result.isJust).toBe(true);
            expect(result.value).toBe(25);
        });

        it('Monad first law (Left identity): do { x′ <- return x; f x′ } = do { f x }', () => {
            const left = function*() {
                const value = yield monad.return(start);
                return run(value);
            }
    
            const right = function*() {
                return run(start);
            }
    
            const result1 = doSingle(left, monad);
            const result2 = doSingle(right, monad);
    
            expect(result1.value).toEqual(result2.value);
            expect(result1.value).toBe(25);    
        });

        it('Monad second law (Right identity): do { x <- m; return x } = do { m }', () => {
            
            const left = function*() {
                const value = yield a;
                return value;
            }

            const right = function*() {
                return a;
            }

            const result1 = doSingle(left, monad);
            const result2 = doSingle(right, monad);

            expect(result1.value).toEqual(result2.value);
            expect(result1.value).toBe(a.value);    
        });

        it(`Monad third law (Associativity):
            do { y <- do { x <- m; f x } g y } =
            do { x <- m; do { y <- f x; g y } } =
            do { x <- m; y <- f x; g y }`, () => {

            const left = function*() {
                const y = yield doSingle(function*() {
                    const x = yield a;
                    return f(x);
                }, monad);

                return g(y);
            };

            const middle = function*() {
                const x = yield a;
                const value = yield doSingle(function*(){
                    const y = yield f(x);
                    return g(y);
                }, monad);

                return value;
            };

            const right = function*() {
                const x = yield a;
                const y = yield f(x);

                return g(y);
            };

            const result1 = doSingle(left, monad);
            const result = doSingle(middle, monad);
            const result2 = doSingle(right, monad);

            expect(result1.value).toBe(result.value);
            expect(result.value).toBe(result2.value);
            expect(result.value).toBe(36);
        });
    });
});