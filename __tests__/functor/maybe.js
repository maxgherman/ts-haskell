import { Maybe } from '@data/maybe';
import { functor } from '@control/functor/maybe';
import { identity, partial, compose } from "ramda";

describe('Maybe functor', () => {
    describe('fmap', () => {
		it('maps over', () => {
			const transformer = (x) => x * x + Math.pow(x, 2);
			const result = functor.fmap(transformer, Maybe.from(3));
			const expected = Maybe.from(18);

			expect(result.value).toEqual(expected.value);
			expect(result.isJust).toBe(true);
		});

		it('uses id for falsy transformer paramter', () => {
			const argument = Maybe.just(10);
			const result = functor.fmap(undefined, argument);
			const expected = identity(argument);
			expect(result.value).toEqual(expected.value);
			expect(result.value).toEqual(argument.value);
		});

		it('uses nothing for false paramter', () => {
			const result = functor.fmap(identity, undefined);
			expect(result.isNothing);
		});
	});

	describe('extensions', () => {
        it('<$>', () => {
            const transformer = (x) => x * x + x/2;
            const argument = Maybe.from(3);

            const result = functor['<$>'](transformer, argument);
            expect(result.value).toEqual(10.5);
            
        });

        it('<$', () => {
            const result = functor['<$'](7, Maybe.from(3));
            expect(result.value).toEqual(7);
        });

        it('$>', () => {
            const result = functor['$>'](Maybe.from(3), 7);
            expect(result.value).toEqual(7);
        });

        it('<&>', () => {
            const transformer = (x) => x * x + x/2;
            const argument = Maybe.from(3);

            const result = functor['<&>'](argument, transformer);
            expect(result.value).toEqual(10.5);
        });
    });

	describe('Functor first law: fmap id = id', () => {
		
		const fmapId = partial(functor.fmap, [identity]);
		
		it('Just', () => {
			const argument = Maybe.from(3);
			const result = fmapId(argument);
			const expected = identity(argument);
			expect(result.value).toEqual(expected.value);
			expect(result.isJust).toEqual(true);

		});

		it('Nothing', () => {
			const argument = Maybe.nothing();
			const result = fmapId(argument);
			const expected = identity(argument);
			expect(result.value).toEqual(expected.value);
			expect(result.isNothing).toEqual(true);
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
		
		it('Just', () => {
			const argument = Maybe.just(3);
			const one = fAB(argument);
			const two = fAfB(argument);
			expect(one.value).toEqual(two.value);
			expect(one.isJust).toBe(true);
			expect(two.isJust).toBe(true);
		});

		it('Nothing', () => {
			const argument = Maybe.nothing();
			const one = fAB(argument);
			const two = fAfB(argument);
			expect(one.value).toEqual(two.value);
			expect(one.isNothing).toBe(true);
			expect(two.isNothing).toBe(true);
		});		
	});
});