import { compose, flip, partial } from 'ramda';
import { monad } from '@control/monad/promise';
import { doSingle } from '@control/common/monad';

describe('Promise monad', () => {
    const a = Promise.resolve(3);
    const b = Promise.resolve(5);
    const f = x => Promise.resolve(x + x);
    const g = x => Promise.resolve(x * x);

    describe('return', () => {
        it('returns', () => 
            monad.return(123)
            .then(data => {
                expect(data).toBe(123);    
            })
        );

        it('returns falsy for falsy arg', () =>
            monad.return(undefined)
            .then(data => {
                expect(data).toBe(undefined);
            })
        );
    });

    describe('>>=', () => {
        it('returns for valid args', () =>
            monad['>>='](a, g)
            .then(data => {
                expect(data).toBe(3 * 3);
            })
        );

        it('uses falsy for falsy first arg', () =>
            monad['>>='](undefined, g)
            .then(data => {
                expect(data).toBe(NaN);
            })
        );

        it('uses falsy for falsy second arg', () =>
            monad['>>='](a, undefined)
            .then(data => {
                expect(data).toBe(undefined);
            })
        );
    });

    describe('>>', () => {
        it('returns for valid args', () =>
            monad['>>'](a, b)
            .then(data => {
                expect(data).toEqual(5);
            })
        );

        it('uses second arg for falsy first arg', () =>
            monad['>>'](undefined, b)
            .then(data => {
                expect(data).toBe(5);
            })
        );

        it('uses false for falsy second arg', () =>
            monad['>>'](a, undefined)
            .then(data => {
                expect(data).toBe(undefined);
            })
        );
    });

    describe('fail', () => {
        it('returns for valid args', () => 
            monad.fail('Test')
            .catch(data => {
                expect(data).toBe('Test');
            })
        );

        it('returns for falsy args', () =>
            monad.fail(undefined)
            .catch(data => {
                expect(data).toBe(undefined);
            })
       );
    });

    describe('Monad first law (Left identity): return a >>= k = k a', () => {
        it('direct', () => {
            const result1 = monad['>>='](monad.return(3), g);
            const result2 = g(3);

            return Promise.all([result1, result2])
            .then(([value1, value2]) => {
                expect(value1).toBe(value2);
                expect(value2).toBe(9);
            });
        });

        it('with compose', () => {
            
            const result1 = compose(
                partial(flip(monad['>>=']), [g]),
                () => monad.return(3)
            )();
            
            const result2 = g(3);

            return Promise.all([result1, result2])
            .then(([value1, value2]) => {
                expect(value1).toBe(value2);
                expect(value2).toBe(9);
            });
        });
    });

    describe('Monad second law (Right identity): m >>= return =	m', () => {

        it('direct', () => {
            const result = monad['>>='](a, monad.return); 
            
            return Promise.all([result, a])
            .then(([value1, value2]) => {
                expect(value1).toBe(value2);
            });
        });

        it('with compose', () => {

            const result = compose(
                partial(monad['>>='], [a]),
             )(monad.return);
            
             return Promise.all([result, a])
             .then(([value1, value2]) => {
                 expect(value1).toBe(value2);
             });
        });
    });

    describe('Monad third law (Associativity): (m >>= f) >>= g = m >>= (\\x -> f x >>= g)', () => {
        it('direct', () => {
            const result1 = monad['>>='](monad['>>='](a, f), g);
            const result2 = monad['>>='](a, (x) => monad['>>='](f(x), g));

            return Promise.all([result1, result2])
             .then(([value1, value2]) => {
                expect(value1).toBe(value2);
                expect(value1).toBe((3+3) * (3+3));
            });
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

            return Promise.all([result1, result2])
             .then(([value1, value2]) => {
                expect(value1).toBe(value2);
                expect(value1).toBe((3+3) * (3+3));
            });
        });
    });

    describe('Monad - Applicative first relationship: pure = return', () => {

        it('for Right', () => {
            const result1 = monad.return(5);
            const result2 = monad.pure(5);

            return Promise.all([result1, result2])
            .then(([value1, value2]) => {
                expect(value1).toBe(value2);
                expect(value1).toBe(5);
           });
        });

        it('for Nothing', () => {
            const result1 = monad.return(undefined);
            const result2 = monad.pure(undefined);

            return Promise.all([result1, result2])
            .then(([value1, value2]) => {
                expect(value1).toBe(undefined);
                expect(value2).toBe(undefined);
           });
        });
    });

    describe('do - notation', () => {
        const run = (x) => Promise.resolve(x*x);
        const start = 5;

        it('returns', () => {
            const test = function*() {
                const value1 = yield monad.return(start);
                return run(value1);
            };

            const result = doSingle(test, monad);

            return result.then(data => {
                expect(data).toBe(25);
            });
        });

        it('returns as yield', () => {
            const test = function*() {
                const value1 = yield monad.return(start);
                const value2 = yield run(value1);

                return value2;
            };

            const result = doSingle(test, monad);

            return result.then(data => {
                expect(data).toBe(25);
            });
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
    
            return Promise.all([result1, result2])
            .then(([value1, value2]) => {
                expect(value1).toBe(value2);
                expect(value1).toBe(25);
            });
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

            return Promise.all([result1, result2, a])
            .then(([value1, value2, value3]) => {
                expect(value1).toBe(value2);
                expect(value1).toBe(value3);
            });
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

            return Promise.all([result1, result, result2])
            .then(([value1, value, value2]) => {
                expect(value1).toBe(value);
                expect(value).toBe(value2);
                expect(value).toBe(36);
            });
        });
    });
});