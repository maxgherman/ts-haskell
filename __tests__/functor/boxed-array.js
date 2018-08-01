import { BoxedArray } from '@data/boxed-array';
import { functor } from '@control/functor/boxed-array';
import { identity, partial, compose } from "ramda";

describe('BoxedArray functor', () => {
    describe('fmap', () => {
		it('maps over', () => {
			const transformer = (x) => x * x + Math.pow(x, 2);
			const result = functor.fmap(transformer, BoxedArray.from([1, 2, 3]));
			const expected = BoxedArray.from([2, 8, 18]);

			expect(result).toEqual(expected);
		});

		it('uses id for falsy transformer paramter', () => {
			const result = functor.fmap(undefined, BoxedArray.from([1]));
			expect(result.value).toEqual(BoxedArray.from([1]).value);
		});

		it('uses empty array for false array paramter', () => {
			const result = functor.fmap(undefined, undefined);
			expect(result.value).toEqual(BoxedArray.from([]).value);
		});
	});

	describe('extensions', () => {
        it('<$>', () => {
            const transformer = (x) => x * x + x/2;
            const argument = BoxedArray.from([1, 2, 3]);

            const result = functor['<$>'](transformer, argument);
            expect(result.value).toEqual([1.5, 5, 10.5]);
            
        });

        it('<$', () => {
            const result = functor['<$'](7, BoxedArray.from([1, 2, 3]));
            expect(result.value).toEqual([7, 7, 7]);
        });

        it('$>', () => {
            const result = functor['$>'](BoxedArray.from([1, 2, 3]), 7);
            expect(result.value).toEqual([7, 7, 7]);
        });

        it('<&>', () => {
            const transformer = (x) => x * x + x/2;
            const argument = BoxedArray.from([1, 2, 3]);

            const result = functor['<&>'](argument, transformer);
            expect(result.value).toEqual([1.5, 5, 10.5]);
        });
    });

	describe('Functor first law: fmap id = id', () => {
		
		const fmapId = partial(functor.fmap, [identity]);
		
		it('non empty array', () => {
			const argument = BoxedArray.from([1, 2, 3]);
			const result = fmapId(argument);
			const expected = identity(argument);
			expect(result.value).toEqual(expected.value);
			expect(result.value).toEqual([1, 2, 3]);
		});

		it('empty array', () => {
			const argument = BoxedArray.from([]);
			const result = fmapId(argument);
			const expected = identity(argument);
			expect(result.value).toEqual(expected.value);
			expect(result.value).toEqual([]);
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
			const argument = BoxedArray.from([1, 2, 3]);
			const result1 = fAB(argument).value;
			const result2 = fAfB(argument).value;
			expect(result1).toEqual(result2);
			expect(result1).toEqual([5, 8, 11]);
		});

		it('empty array', () => {
			const argument = BoxedArray.from([]);
			const result1 = fAB(argument).value;
			const result2 = fAfB(argument).value;
			expect(result1).toEqual(result2);
			expect(result1).toEqual([]);
		});		
	});
});