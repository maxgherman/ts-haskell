import { compose, partial, flip } from 'ramda';
import { monad } from '@control/monad/list';
import { doRepeat } from '@control/common/monad';
import { List  } from '@data/list';

describe('List monad', () => {
    const a = List.empty()[':'](3)[':'](2)[':'](1);
    const b = List.empty()[':'](6)[':'](5)[':'](4);
    const f = x =>  List.empty()[':'](x)[':'](x);
    const g = x => List.single(x * x);

    describe('return', () => {
        it('returns single list', () => {
            const result = monad.return(1);
            expect(result.head).toEqual(1);
            expect(result.isSingle).toBe(true);
        });

        it('returns empty list for falsy args', () => {
            const result = monad.return(undefined);
            expect(result.isEmpty).toBe(true);
        });
    });

    describe('>>=', () => {
        it('returns for valid args', () => {
            const result = monad['>>='](a, g);
            expect(result.toArray()).toEqual([1, 4, 9]);
        });

        it('uses empty list for falsy first arg', () => {
            const result = monad['>>='](undefined, g);
            expect(result.isEmpty).toBe(true);
        });

        it('uses empty list for falsy second paramter', () => {
            const result = monad['>>='](a, undefined);
            expect(result.isEmpty).toBe(true);
        });
    });

    describe('>>', () => {
        it('returns for valid args', () => {
            const result = monad['>>'](a, b);
            expect(result.toArray()).toEqual([4, 5, 6, 4, 5, 6, 4, 5, 6]);
        });

        it('uses right arg for falsy first arg', () => {
            const result = monad['>>'](undefined, b);
            expect(result.toArray()).toEqual(b.toArray());
        });

        it('uses empty list for falsy second arg', () => {
            const result = monad['>>'](a, undefined);
            expect(result.isEmpty).toBe(true);
        });
    });

    describe('fail', () => {
        it('returns for valid args', () => {
            const result = monad.fail('Test');
            expect(result.isEmpty).toBe(true);
        });

        it('returns for falsy args', () => {
            const result = monad.fail(undefined);
            expect(result.isEmpty).toBe(true);
        });
    });

    describe('Monad first law (Left identity): return a >>= k = k a', () => {
        it('direct', () => {
            const result1 = monad['>>='](monad.return(3), g);
            const result2 = g(3);

            expect(result1.toArray()).toEqual(result2.toArray());
            expect(result1.toArray()).toEqual([9]);
        });

        it('with compose', () => {
            
            const result1 = compose(
                partial(flip(monad['>>=']), [g]),
                () => monad.return(3)
            )();
            
            const result2 = g(3);

            expect(result1.toArray()).toEqual(result2.toArray());
            expect(result1.toArray()).toEqual([9]);
        });
    });

    describe('Monad second law (Right identity): m >>= return =	m', () => {

        it('direct', () => {
            const result = monad['>>='](a, monad.return); 
            expect(result.toArray()).toEqual(a.toArray());
        });

        it('with compose', () => {

            const result = compose(
                partial(monad['>>='], [a]),
             )(monad.return);
            
            expect(result.toArray()).toEqual(a.toArray());
        });
    });

    describe('Monad third law (Associativity): (m >>= f) >>= g = m >>= (\\x -> f x >>= g)', () => {
        it('direct', () => {
            const result1 = monad['>>='](monad['>>='](a, f), g);
            const result2 = monad['>>='](a, (x) => monad['>>='](f(x), g));

            expect(result1.toArray()).toEqual(result2.toArray());
            expect(result1.toArray()).toEqual([1, 1, 4, 4, 9, 9]);
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

            expect(result1.toArray()).toEqual(result2.toArray());
            expect(result1.toArray()).toEqual([1, 1, 4, 4, 9, 9]);
        });
    });

    describe('Monad - Applicative first relationship: pure = return', () => {

        it('for non empty array', () => {
            expect(monad.return(5).toArray()).toEqual(monad.pure(5).toArray());
            expect(monad.pure(5).toArray()).toEqual([5]);
        });

        it('for empty array', () => {
            expect(monad.return(null).isEmpty).toEqual(monad.pure(null).isEmpty);
        });
    });

    describe('do - notation', () => {
        const run = (x) => List.empty()[':'](x + 1)[':'](x)[':'](x - 1);
        const start = 1;

        it('returns', () => {
            const test = function*() {
                const value1 = yield run(start);
                return run(value1);
            };
            
            const result = doRepeat(test, monad);
            expect(result.toArray()).toEqual([-1,0,1,0,1,2,1,2,3]);
        });

        it('returns as yield', () => {
            const test = function*() {
                const value1 = yield run(start);
                const value2 = yield run(value1);
                return value2;
            };
            
            const result = doRepeat(test, monad);
            expect(result.toArray()).toEqual([-1,0,1,0,1,2,1,2,3]);
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
    
            expect(result1.toArray()).toEqual(result2.toArray());
            expect(result1.toArray()).toEqual([0, 1, 2]);    
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

            expect(result1.toArray()).toEqual(result2.toArray());
            expect(result1.toArray()).toEqual(a.toArray());    
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
                const value = yield doRepeat(function*(){
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

            expect(result1.toArray()).toEqual(result.toArray());
            expect(result.toArray()).toEqual(result2.toArray());
            expect(result.toArray()).toEqual([1, 1, 4, 4, 9, 9]);
        });
    });
});