import { functor as baseFunctor } from '@control/functor/reader';
import { identity, partial, compose } from "ramda";

const functor = baseFunctor();

describe('Reader functor', () => {
    describe('fmap', () => {
        it('maps over', () => {
            const transformer = (x) => x  + x;
            const result = functor.fmap(transformer, (x) => x - 10);
            const expected = 180;
          
            expect(result(100)).toBe(expected);
        });

        it('uses id for falsy transformer paramter', () => {
			const result = functor.fmap(undefined, (x) => x + 10);
			expect(result(100)).toBe(110);
		});

        it('uses id for false second paramter', () => {
			const result = functor.fmap(undefined, undefined);
			expect(result(100)).toBe(100);
		});
    });

    describe('extensions', () => {
        it('<$>', () => {
            const transformer = (x) => x * x + x/2;
            const argument = (x) => x + 1

            const result = functor['<$>'](transformer, argument);
            expect(result(10)).toBe(126.5);
            
        });

        it('<$', () => {
            const result = functor['<$'](7, (x) => x + 1);
            expect(result(10)).toBe(7);
        });

        it('$>', () => {
            const result = functor['$>']((x) => x + 1, 7);
            expect(result(10)).toBe(7);
        });

        it('<&>', () => {
            const transformer = (x) => x * x + x/2;
            const argument = (x) => x + 1;

            const result = functor['<&>'](argument, transformer);
            expect(result(10)).toBe(126.5);
        });
    });

    describe('Functor first law: fmap id = id', () => {
        const fmapId = partial(functor.fmap, [identity]);
		
		it('non empty value', () => {
			const argument = (x) => x + 10;
			const result = fmapId(argument);
			const expected = identity(argument);
			
            const resultValue = result(10);
            const expectedValue = expected(10);
            
            expect(resultValue).toBe(expectedValue);
            expect(resultValue).toBe(20);
		});
    
        it('empty value', () => {
			const argument = null;
			const result = fmapId(argument);
			expect(result(10)).toBe(identity(10));
		});
    });

    describe('Functor second law: fmap (f . g) = fmap f . fmap g', () => {
        const a = (x) => x + 2;
		const b = (x) => x * 3;
		const ab = compose(a, b);
		const fA = partial(functor.fmap, [a]);
		const fB = partial(functor.fmap, [b]);
		const fAB = partial(functor.fmap, [ab]);
		const fAfB = compose(fA, fB);

        it('non empty value', () => {
			const argument = (x) => x + 1;
			const result1 = fAB(argument);
			const result2 = fAfB(argument);
            const result1Value = result1(10);
            const result2Value = result2(10);

			expect(result1Value).toBe(result2Value);

            // 10 => x + 1 => x * 3 => x + 2 => 35
            expect(result1Value).toBe(35);
		});

        it('empty array', () => {
			const argument = null;
			const result1 = fAB(argument);
			const result2 = fAfB(argument);
			
            const result1Value = result1(10);
            const result2Value = result2(10);

            expect(result1Value).toBe(result2Value);
			expect(result1Value).toBe(32);
		});
    });
});