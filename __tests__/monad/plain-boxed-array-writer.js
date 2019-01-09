import each from 'jest-each';
import { compose, flip, partial } from 'ramda';
import { Writer } from '@data/writer';
import { BoxedArray } from '@data/boxed-array';
import { monad as monadBase } from '@control/monad/writer';
import { monoid as plMonoid } from '@control/monoid/plain-array';
import { monoid as baMonoid } from '@control/monoid/boxed-array';
import { doRepeat } from '@control/common/monad';

describe('PlainArray/BoxedArray Writer monad', () => {
    const arraySetUp = {
        monad: monadBase(plMonoid),
        a: Writer.from([3, ['Test A']]),
        b: Writer.from([5, ['Test B']]),
        f: x => Writer.from([x + x, ['Test X + X']]),
        g: x => Writer.from([x * x, ['Test X * X']]),
        run: (x) => Writer.from([-2 * x , ['Test Run']]),

        verifyLog: (actual, expected) => {
            expect(actual).toEqual(expected);
        }
    };
    
    const boxedArraySetUp = {
        monad: monadBase(baMonoid),
        a: Writer.from([3, BoxedArray.from(['Test A'])]),
        b: Writer.from([5, BoxedArray.from(['Test B'])]),
        f: x => Writer.from([x + x, BoxedArray.from(['Test X + X'])]),
        g: x => Writer.from([x * x, BoxedArray.from(['Test X * X'])]),
        run: (x) => Writer.from([-2 * x , BoxedArray.from(['Test Run'])]),

        verifyLog: (actual, expected) => {
            expect(actual.value).toEqual(expected);
        }
    };
    
    describe('return', () => {
        
        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('returns', (setUp) => {
            const monad = setUp.monad;
            
            const result = monad.return(1);
            const [data, log] = result.runWriter();

            expect(data).toBe(1);
            setUp.verifyLog(log, []);
        });

        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('returns arg for falsy args', (setUp) => {
            const monad = setUp.monad;
            
            const result = monad.return(undefined);
            const [data, log] = result.runWriter();

            expect(data).toBe(undefined);
            setUp.verifyLog(log, []);  
        });
    });

    describe('>>=', () => {

        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('returns for valid args', (setUp) => {
            const monad = setUp.monad;
            const a = setUp.a;
            const g = setUp.g;
            
            const result = monad['>>='](a, g);

            const [data, log] = result.runWriter();
            expect(data).toBe(3 * 3);
            setUp.verifyLog(log, ['Test A', 'Test X * X']);
        });

        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('uses empty array for falsy first arg', (setUp) => {
            const monad = setUp.monad;
            const g = setUp.g;
 
            const result = monad['>>='](undefined, g);
            
            const [data, log] = result.runWriter();
            expect(data).toBe(NaN);
            setUp.verifyLog(log, ['Test X * X']);
        });

        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('uses arg for falsy second paramter', (setUp) => {
            const monad = setUp.monad;
            const a = setUp.a;
           
            const result = monad['>>='](a, undefined);
          
            const [data, log] = result.runWriter();
            expect(data).toBe(undefined);
            setUp.verifyLog(log, ['Test A']);
        });
    });

    describe('>>', () => {
        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('returns for valid args', (setUp) => {
            const monad = setUp.monad;
            const a = setUp.a;
            const b = setUp.b;
            
            const result = monad['>>'](a, b);
            
            const [data, log] = result.runWriter();
            expect(data).toBe(5);
            setUp.verifyLog(log, ['Test A', 'Test B']);
        });

        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('uses empty array for falsy first arg', (setUp) => {
            const monad = setUp.monad;
            const b = setUp.b;
            
            const result = monad['>>'](undefined, b);

            const [data, log] = result.runWriter();
            expect(data).toBe(5);
            setUp.verifyLog(log, ['Test B']);
        });

        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('uses empty array for falsy second arg', (setUp) => {
            const monad = setUp.monad;
            const a = setUp.a;
           
            const result = monad['>>'](a, undefined);
            
            const [data, log] = result.runWriter();
            expect(data).toBe(undefined);
            setUp.verifyLog(log, ['Test A']);
        });
    });

    describe('fail', () => {
        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('returns for valid args', (setUp) => {
            const monad = setUp.monad;
            
            const result = monad.fail('Test');

            const [data, log] = result.runWriter();
            expect(data).toBe(undefined);
            setUp.verifyLog(log, []);
        });

        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('returns for falsy args', (setUp) => {
            const monad = setUp.monad;
            
            const result = monad.fail(undefined);

            const [data, log] = result.runWriter();
            expect(data).toBe(undefined);
            setUp.verifyLog(log, []);
        });
    });

    describe('Monad first law (Left identity): return a >>= k = k a', () => {
        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('direct', (setUp) => {
            const monad = setUp.monad;
            const g = setUp.g;
            const expectedLog = ['Test X * X'];
            
            const result1 = monad['>>='](monad.return(3), g);
            const result2 = g(3);

            const [data1, log1] = result1.runWriter();
            const [data2, log2] = result2.runWriter();

            expect(data1).toBe(data2);
            expect(data1).toBe(3 * 3);
            setUp.verifyLog(log1, expectedLog);
            setUp.verifyLog(log2, expectedLog);
        });

        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('with compose', (setUp) => {
            const monad = setUp.monad;
            const g = setUp.g;
            const expectedLog = ['Test X * X'];

            const result1 = compose(
                partial(flip(monad['>>=']), [g]),
                () => monad.return(3)
            )();
            
            const result2 = g(3);

            const [data1, log1] = result1.runWriter();
            const [data2, log2] = result2.runWriter();
            
            expect(data1).toBe(data2);
            expect(data1).toBe(3 * 3);
            setUp.verifyLog(log1, expectedLog);
            setUp.verifyLog(log2, expectedLog);
        });
    });

    describe('Monad second law (Right identity): m >>= return =	m', () => {

        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('direct', (setUp) => {
            const monad = setUp.monad;
            const a = setUp.a;
            const expectedLog = ['Test A'];
          
            const result1 = monad['>>='](a, monad.return); 
            const [data1, log1] = result1.runWriter();
            const [data2, log2] = setUp.a.runWriter();

            expect(data1).toBe(3);
            expect(data1).toBe(data2);
            setUp.verifyLog(log1, expectedLog);
            setUp.verifyLog(log2, expectedLog);
        });
        
        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('with compose', (setUp) => {
            const monad = setUp.monad;
            const a = setUp.a;
            const expectedLog = ['Test A'];
           
            const result1 = compose(
                partial(monad['>>='], [a]),
             )(monad.return);

            const [data1, log1] = result1.runWriter();
            const [data2, log2] = setUp.a.runWriter();

            expect(data1).toBe(3);
            expect(data1).toBe(data2);
            setUp.verifyLog(log1, expectedLog);
            setUp.verifyLog(log2, expectedLog);
        });
    });

    describe('Monad third law (Associativity): (m >>= f) >>= g = m >>= (\\x -> f x >>= g)', () => {
        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('direct', (setUp) => {
            const monad = setUp.monad;
            const a = setUp.a;
            const f = setUp.f;
            const g = setUp.g;
            const expectedLog = ['Test A', 'Test X + X', 'Test X * X'];

            const result1 = monad['>>='](monad['>>='](a, f), g);
            const result2 = monad['>>='](a, (x) => monad['>>='](f(x), g));

            const [data1, log1] = result1.runWriter();
            const [data2, log2] = result2.runWriter();
            
            expect(data1).toBe(data2);
            expect(data1).toBe((3 + 3) * (3 + 3));
            setUp.verifyLog(log1, expectedLog);
            setUp.verifyLog(log2, expectedLog);
        });

        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('with compose', (setUp) => {
            const monad = setUp.monad;
            const a = setUp.a;
            const f = setUp.f;
            const g = setUp.g;
            const expectedLog = ['Test A', 'Test X + X', 'Test X * X'];

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
            expect(data1).toBe((3 + 3) * (3 + 3));
            setUp.verifyLog(log1, expectedLog);
            setUp.verifyLog(log2, expectedLog);
        });
    });

    describe('Monad - Applicative first relationship: pure = return', () => {

        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('for non arg', (setUp) => {
            const monad = setUp.monad;

            const result1 = monad.return(5);
            const result2 = monad.pure(5);

            const [data1, log1] = result1.runWriter();
            const [data2, log2] = result2.runWriter();
            
            expect(data1).toBe(data2);
            setUp.verifyLog(log1, []);
            setUp.verifyLog(log2, []); 
        });

        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('for falsy arg', (setUp) => {
            const monad = setUp.monad;
            
            const result1 = monad.return(null);
            const result2 = monad.pure(null);

            const [data1, log1] = result1.runWriter();
            const [data2, log2] = result2.runWriter();
            
            expect(data1).toBe(data2);
            setUp.verifyLog(log1, []);
            setUp.verifyLog(log2, []);
        });
    });

    describe('do - notation', () => {
        const start = 3;

        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('returns', (setUp) => {
            const monad = setUp.monad;
            const run = setUp.run;
            
            const test = function*() {
                const value1 = yield run(start);
                return run(value1);
            };
            
            const result = doRepeat(test, monad);
            const [data, log] = result.runWriter();
            
            expect(data).toBe(12);
            setUp.verifyLog(log, ['Test Run', 'Test Run']);
        });

        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('returns as yield', (setUp) => {
            const monad = setUp.monad;
            const run = setUp.run;
            
            const test = function*() {
                const value1 = yield run(start);
                const value2 = yield run(value1);

                return value2;
            };

            const result = doRepeat(test, monad);
            const [data, log] = result.runWriter();
            
            expect(data).toBe(12);
            setUp.verifyLog(log, ['Test Run', 'Test Run']);
        });

        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('Monad first law (Left identity): do { x′ <- return x; f x′ } = do { f x }',
        (setUp) => {
            const monad = setUp.monad;
            const run = setUp.run;
            const expectedLog = ['Test Run'];

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
            expect(data1).toBe(-6);
            setUp.verifyLog(log1, expectedLog);
            setUp.verifyLog(log2, expectedLog);
        });

        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it('Monad second law (Right identity): do { x <- m; return x } = do { m }',
        (setUp) => {
            const monad = setUp.monad;
            const a = setUp.a;
            const expectedLog = ['Test A'];

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
            expect(data1).toBe(3);
            setUp.verifyLog(log1, expectedLog);
            setUp.verifyLog(log2, expectedLog);    
        });

        each([
            [ arraySetUp ],
            [ boxedArraySetUp ]
        ])
        .it(`Monad third law (Associativity):
            do { y <- do { x <- m; f x } g y } =
            do { x <- m; do { y <- f x; g y } } =
            do { x <- m; y <- f x; g y }`, (setUp) => {

            const monad = setUp.monad;
            const a = setUp.a;
            const f = setUp.f;
            const g = setUp.g;
            const expectedLog = ['Test A', 'Test X + X', 'Test X * X'];

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
            expect(data1).toBe(data2);
            expect(data1).toBe((3 + 3) * (3 + 3));
            setUp.verifyLog(log1, expectedLog);
            setUp.verifyLog(log, expectedLog);
            setUp.verifyLog(log2, expectedLog);
        });
    });
});
