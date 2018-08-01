import { functor } from '@control/functor/plain-array';
import { identity, partial, compose } from "ramda";

describe('PlainArray functor', () => {
	
	describe('fmap', () => {
		it('maps over', () => {
			const transformer = (x) => x * x + x;
			const result = functor.fmap(transformer, [1, 2, 3]);
			const expected = [2, 6, 12];

			expect(result).toEqual(expected);
		});

		it('uses id for falsy transformer paramter', () => {
			const result = functor.fmap(undefined, [1]);
			expect(result).toEqual([1]);
		});

		it('uses empty array for false array paramter', () => {
			const result = functor.fmap(undefined, undefined);
			expect(result).toEqual([]);
		});
	});

	describe('extensions', () => {
        it('<$>', () => {
            const transformer = (x) => x * x + x/2;
            const argument = [1, 2, 3];

            const result = functor['<$>'](transformer, argument);
            expect(result).toEqual([1.5, 5, 10.5]);
            
        });

        it('<$', () => {
            const result = functor['<$'](7, [1, 2, 3]);
            expect(result).toEqual([7, 7, 7]);
        });

        it('$>', () => {
            const result = functor['$>']([1, 2, 3], 7);
            expect(result).toEqual([7, 7, 7]);
        });

        it('<&>', () => {
            const transformer = (x) => x * x + x/2;
            const argument = [1, 2, 3];

            const result = functor['<&>'](argument, transformer);
            expect(result).toEqual([1.5, 5, 10.5]);
        });
    });
	
	describe('Functor first law: fmap id = id', () => {
		
		const fmapId = partial(functor.fmap, [identity]);
		
		it('non empty array', () => {
			const argument = [1, 2, 3];
			const result = fmapId(argument);
			const expected = identity(argument);
			expect(result).toEqual(expected);
			expect(result).toEqual([1, 2, 3]);
		});

		it('empty array', () => {
			const argument = [];
			const result = fmapId(argument);
			const expected = identity(argument);
			expect(result).toEqual(expected);
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
		
		it('non empty array', () => {
			const argument = [1, 2, 3];
			const result1 = fAB(argument);
			const result2 = fAfB(argument);
			expect(result1).toEqual(result2);
			expect(result1).toEqual([5, 8, 11]);
		});

		it('empty array', () => {
			const argument = [];
			const result1 = fAB(argument);
			const result2 = fAfB(argument);
			expect(result1).toEqual(result2);
			expect(result1).toEqual([]);
		});		
	});
});