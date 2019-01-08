import { compose, flip, partial } from 'ramda';
import { Writer } from '@data/writer';
import { monad as monadBase } from '@control/monad/writer';
import { monoid } from '@control/monoid/plain-array';
import { doRepeat } from '@control/common/monad';

const monad = monadBase(monoid);

describe('PlainArray Writer monad', () => {
    const a = Writer.from([3, ['Test A']]);
    const b = Writer.from([5, ['Test B']]);
    const f = x => Writer.from([x + x, ['Test X + X']]);
    const g = x => Writer.from([x * x, ['Test X * X']]);
    
    describe('return', () => {
        it('returns', () => {
            const result = monad.return(1);
            const [data, log] = result.runWriter();

            expect(data).toBe(1);
            expect(log).toEqual([]);
        });

        it('returns arg for falsy args', () => {
            const result = monad.return(undefined);
            const [data, log] = result.runWriter();

            expect(data).toBe(undefined);
            expect(log).toEqual([]);      
        });
    });

    describe('>>=', () => {
        it('returns for valid args', () => {
            const result = monad['>>='](a, g);

            const [data, log] = result.runWriter();
            expect(data).toBe(3 * 3);
            expect(log).toEqual(['Test A', 'Test X * X']);
        });

        it('uses empty array for falsy first arg', () => {
            const result = monad['>>='](undefined, g);
            
            const [data, log] = result.runWriter();
            expect(data).toBe(NaN);
            expect(log).toEqual(['Test X * X']);
        });

        it('uses arg for falsy second paramter', () => {
            const result = monad['>>='](a, undefined);
          
            const [data, log] = result.runWriter();
            expect(data).toBe(undefined);
            expect(log).toEqual(['Test A']);
        });
    });

    describe('>>', () => {
        it('returns for valid args', () => {
            const result = monad['>>'](a, b);
            
            const [data, log] = result.runWriter();
            expect(data).toBe(5);
            expect(log).toEqual(['Test A', 'Test B']);
        });

        it('uses empty array for falsy first arg', () => {
            const result = monad['>>'](undefined, b);

            const [data, log] = result.runWriter();
            expect(data).toBe(5);
            expect(log).toEqual(['Test B']);
        });

        it('uses empty array for falsy second arg', () => {
            const result = monad['>>'](a, undefined);
            
            const [data, log] = result.runWriter();
            expect(data).toBe(undefined);
            expect(log).toEqual(['Test A']);
        });
    });

    describe('fail', () => {
        it('returns for valid args', () => {
            const result = monad.fail('Test');

            const [data, log] = result.runWriter();
            expect(data).toBe(undefined);
            expect(log).toEqual([]);
        });

        it('returns for falsy args', () => {
            const result = monad.fail(undefined);

            const [data, log] = result.runWriter();
            expect(data).toBe(undefined);
            expect(log).toEqual([]);
        });
    });

    describe('Monad first law (Left identity): return a >>= k = k a', () => {
        it('direct', () => {
            const result1 = monad['>>='](monad.return(3), g);
            const result2 = g(3);

            const [data1, log1] = result1.runWriter();
            const [data2, log2] = result2.runWriter();

            expect(data1).toBe(data2);
            expect(log1).toEqual(log2);
            expect(data1).toBe(3 * 3);
            expect(log1).toEqual(['Test X * X']);
        });

        it('with compose', () => {
            
            const result1 = compose(
                partial(flip(monad['>>=']), [g]),
                () => monad.return(3)
            )();
            
            const result2 = g(3);

            const [data1, log1] = result1.runWriter();
            const [data2, log2] = result2.runWriter();
            
            expect(data1).toBe(data2);
            expect(log1).toEqual(log2);
            expect(data1).toBe(3 * 3);
            expect(log1).toEqual(['Test X * X']);
        });
    });

    describe('Monad second law (Right identity): m >>= return =	m', () => {

        it('direct', () => {
            const result = monad['>>='](a, monad.return); 
            const [data, log] = result.runWriter();

            expect(data).toBe(3);
            expect(log).toEqual(['Test A']);
        });

        it('with compose', () => {

            const result = compose(
                partial(monad['>>='], [a]),
             )(monad.return);

             const [data, log] = result.runWriter();
            
             expect(data).toBe(3);
             expect(log).toEqual(['Test A']);
        });
    });

    describe('Monad third law (Associativity): (m >>= f) >>= g = m >>= (\\x -> f x >>= g)', () => {
        it('direct', () => {
            const result1 = monad['>>='](monad['>>='](a, f), g);
            const result2 = monad['>>='](a, (x) => monad['>>='](f(x), g));

            const [data1, log1] = result1.runWriter();
            const [data2, log2] = result2.runWriter();
            
            expect(data1).toBe(data2);
            expect(log1).toEqual(log2);
            expect(data1).toBe((3 + 3) * (3 + 3));
            expect(log1).toEqual(['Test A', 'Test X + X', 'Test X * X']);
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

            const [data1, log1] = result1.runWriter();
            const [data2, log2] = result2.runWriter();
            
            expect(data1).toBe(data2);
            expect(log1).toEqual(log2);
            expect(data1).toBe((3 + 3) * (3 + 3));
            expect(log1).toEqual(['Test A', 'Test X + X', 'Test X * X']);
        });
    });

    describe('Monad - Applicative first relationship: pure = return', () => {

        it('for non arg', () => {
            const result1 = monad.return(5);
            const result2 = monad.pure(5);

            const [data1, log1] = result1.runWriter();
            const [data2, log2] = result2.runWriter();
            
            expect(data1).toBe(data2);
            expect(log1).toEqual(log2); 
        });

        it('for falsy arg', () => {
            const result1 = monad.return(null);
            const result2 = monad.pure(null);

            const [data1, log1] = result1.runWriter();
            const [data2, log2] = result2.runWriter();
            
            expect(data1).toBe(data2);
            expect(log1).toEqual(log2);
        });
    });

    describe('do - notation', () => {
        const run = (x) => Writer.from([-2 * x , ['Test Run']]);
        const start = 3;

        it('returns', () => {
            const test = function*() {
                const value1 = yield run(start);
                return run(value1);
            };
            
            const result = doRepeat(test, monad);
            const [data, log] = result.runWriter();
            
            expect(data).toBe(12);
            expect(log).toEqual(['Test Run', 'Test Run']);
        });

        it('returns as yield', () => {
            const test = function*() {
                const value1 = yield run(start);
                const value2 = yield run(value1);

                return value2;
            };

            const result = doRepeat(test, monad);
            const [data, log] = result.runWriter();
            
            expect(data).toBe(12);
            expect(log).toEqual(['Test Run', 'Test Run']);
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
    
            const [data1, log1] = result1.runWriter();
            const [data2, log2] = result2.runWriter();
            
            expect(data1).toBe(data2);
            expect(log1).toEqual(log2);
            expect(data1).toBe(-6);
            expect(log1).toEqual(['Test Run']);
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

            const [data1, log1] = result1.runWriter();
            const [data2, log2] = result2.runWriter();
            
            expect(data1).toBe(data2);
            expect(log1).toEqual(log2);
            expect(data1).toBe(3);
            expect(log1).toEqual(['Test A']);    
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

            const [data1, log1] = result1.runWriter();
            const [data, log] = result.runWriter();
            const [data2, log2] = result2.runWriter();
            
            expect(data1).toBe(data);
            expect(log1).toEqual(log);
            expect(data1).toBe(data2);
            expect(log1).toEqual(log2);
            expect(data1).toBe((3 + 3) * (3 + 3));
            expect(log1).toEqual(['Test A', 'Test X + X', 'Test X * X']);
        });
    });
});
