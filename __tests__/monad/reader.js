import { compose, flip, partial } from 'ramda';
import { monad as monadBase } from '@control/monad/reader';
import { Reader } from '@data/reader';
import { doRepeat } from '@control/common/monad';

const monad = monadBase();

describe('Reader monad', () => {
    const a = Reader.from((x) => x + 1);
    const b = Reader.from((x) => x * 2);
    const f = r => Reader.from(x => r + x);
    const g = r => Reader.from(x => r * x);

    describe('return', () => {
        it('returns', () => {
            const result = monad.return(1);
            expect(result.runReader(10)).toBe(1);
        });

        it('returns arg for falsy args', () => {
            const result = monad.return(undefined);
            expect(result.runReader(10)).toBe(undefined);
        });
    });

    describe('>>=', () => {
        it('returns for valid args', () => {
            const result = monad['>>='](a, g);
            expect(result.runReader(10)).toBe(110);
        });

        it('uses empty array for falsy first arg', () => {
            const result = monad['>>='](undefined, g);
            expect(result.runReader(10)).toBe(100);
        });

        it('uses arg for falsy second paramter', () => {
            const result = monad['>>='](a, undefined);
            expect(result.runReader(10)).toBe(10);
        });
    });

    describe('>>', () => {
        it('returns for valid args', () => {
            const result = monad['>>'](a, b);
            expect(result.runReader(10)).toBe(20);
        });

        it('uses empty array for falsy first arg', () => {
            const result = monad['>>'](undefined, b);
            expect(result.runReader(10)).toBe(20);
        });

        it('uses empty array for falsy second arg', () => {
            const result = monad['>>'](a, undefined);
            expect(result.runReader(10)).toBe(10);
        });
    });

    describe('fail', () => {
        it('returns for valid args', () => {
            const result = monad.fail('Test');
            expect(result.runReader(10)).toBe(10);
        });

        it('returns for falsy args', () => {
            const result = monad.fail(undefined);
            expect(result.runReader(10)).toBe(10);
        });
    });

    describe('Monad first law (Left identity): return a >>= k = k a', () => {
        it('direct', () => {
            const result1 = monad['>>='](monad.return(3), g);
            const result2 = g(3);

            expect(result1.runReader(10)).toBe(result2.runReader(10));
            expect(result1.runReader(10)).toBe(30);
        });

        it('with compose', () => {
            
            const result1 = compose(
                partial(flip(monad['>>=']), [g]),
                () => monad.return(3)
            )();
            
            const result2 = g(3);

            expect(result1.runReader(10)).toBe(result2.runReader(10));
            expect(result1.runReader(10)).toBe(30);
        });
    });

    describe('Monad second law (Right identity): m >>= return =	m', () => {

        it('direct', () => {
            const result = monad['>>='](a, monad.return); 
            expect(result.runReader(10)).toBe(a.runReader(10));
        });

        it('with compose', () => {

            const result = compose(
                partial(monad['>>='], [a]),
             )(monad.return);
            
            expect(result.runReader(10)).toBe(a.runReader(10));
        });
    });

    describe('Monad third law (Associativity): (m >>= f) >>= g = m >>= (\\x -> f x >>= g)', () => {
        it('direct', () => {
            const result1 = monad['>>='](monad['>>='](a, f), g);
            const result2 = monad['>>='](a, (x) => monad['>>='](f(x), g));

            expect(result1.runReader(10)).toBe(result2.runReader(10));
            expect(result1.runReader(10)).toBe(210);
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

            expect(result1.runReader(10)).toBe(result2.runReader(10));
            expect(result1.runReader(10)).toBe(210);
        });
    });

    describe('Monad - Applicative first relationship: pure = return', () => {

        it('for non arg', () => {
            expect(monad.return(5).runReader(10)).toEqual(monad.pure(5).runReader(10));
            expect(monad.pure(5).runReader(10)).toBe(5);
        });

        it('for empty array', () => {
            expect(monad.return(null).runReader(10)).toBe(monad.pure(null).runReader(10));
        });
    });

    describe('do - notation', () => {
        const run = (r) => Reader.from((x) => Math.max(r, x));
        const start = 10;

        it('returns', () => {
            const test = function*() {
                const value1 = yield run(start);
                return run(value1);
            };
            
            const result = doRepeat(test, monad);
            expect(result.runReader(1)).toBe(10);
            expect(result.runReader(20)).toBe(20);
        });

        it('returns as yield', () => {
            const test = function*() {
                const value1 = yield monad.return(start);
                const value2 = yield run(value1);

                return value2;
            };

            const result = doRepeat(test, monad);
            expect(result.runReader(1)).toBe(10);
            expect(result.runReader(20)).toBe(20);
        });

        it('Monad first law (Left identity): do { x′ <- return x; f x′ } = do { f x }', () => {
            const left = function*() {
                const value = yield monad.return(start);
                return run(value);
            }
    
            const right = function*() {
                return run(start);
            }
    
            const result1 = doRepeat(left, monad);
            const result2 = doRepeat(right, monad);
    
            expect(result1.runReader(1)).toBe(result2.runReader(1));
            expect(result1.runReader(1)).toBe(10);
            expect(result1.runReader(20)).toBe(20);    
        });

        it('Monad second law (Right identity): do { x <- m; return x } = do { m }', () => {
            
            const left = function*() {
                const value = yield a;
                return value;
            }

            const right = function*() {
                return a;
            }

            const result1 = doRepeat(left, monad);
            const result2 = doRepeat(right, monad);

            expect(result1.runReader(1)).toBe(result2.runReader(1));
            expect(result1.runReader(1)).toBe(a.runReader(1));
            expect(result1.runReader(20)).toBe(a.runReader(20));
            expect(result1.runReader(20)).toBe(21);    
        });

        it(`Monad third law (Associativity):
            do { y <- do { x <- m; f x } g y } =
            do { x <- m; do { y <- f x; g y } } =
            do { x <- m; y <- f x; g y }`, () => {

            const left = function*() {
                const y = yield doRepeat(function*() {
                    const x = yield a;
                    return f(x);
                }, monad);

                return g(y);
            };

            const middle = function*() {
                const x = yield a;
                const value = yield doRepeat(function*() {
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

            const result1 = doRepeat(left, monad);
            const result = doRepeat(middle, monad);
            const result2 = doRepeat(right, monad);

            expect(result1.runReader(1)).toBe(result.runReader(1));
            expect(result.runReader(1)).toBe(result2.runReader(1));
            expect(result.runReader(1)).toBe(3);
            expect(result.runReader(20)).toBe(820);
            expect(result1.runReader(20)).toBe(result.runReader(20));
        });
    });
});