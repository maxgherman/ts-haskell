import { List } from '@data/list';
import { functor } from '@control/functor/list';
import { identity, partial, compose } from "ramda";

describe('List functor', () => {
    const a = List.single(3)[':'](2)[':'](1);

    describe('fmap', () => {
        it('maps over', () => {
			const transformer = (x) => x * x + Math.pow(x, 2);
			const result = functor.fmap(transformer, a);

			expect(result.toArray()).toEqual([2, 8, 18]);
        });
        
        it('uses id for falsy transformer paramter', () => {
			const result = functor.fmap(undefined, List.single(1));
			expect(result.toArray()).toEqual([1]);
        });
        
        it('uses empty array for false array paramter', () => {
			const result = functor.fmap(undefined, undefined);
			expect(result.toArray()).toEqual([]);
		});
    });

    describe('extensions', () => {
        it('<$>', () => {
            const transformer = (x) => x * x + x/2;
           
            const result = functor['<$>'](transformer, a);
            expect(result.toArray()).toEqual([1.5, 5, 10.5]);
            
        });

        it('<$', () => {
            const result = functor['<$'](7, a);
            expect(result.toArray()).toEqual([7, 7, 7]);
        });

        it('$>', () => {
            const result = functor['$>'](a, 7);
            expect(result.toArray()).toEqual([7, 7, 7]);
        });

        it('<&>', () => {
            const transformer = (x) => x * x + x/2;

            const result = functor['<&>'](a, transformer);
            expect(result.toArray()).toEqual([1.5, 5, 10.5]);
        });
    });

    describe('Functor first law: fmap id = id', () => {
		
		const fmapId = partial(functor.fmap, [identity]);
		
		it('non empty array', () => {
			const result = fmapId(a);
			const expected = identity(a);
			expect(result.toArray()).toEqual(expected.toArray());
			expect(result.toArray()).toEqual([1, 2, 3]);
		});

		it('empty array', () => {
			const argument = List.empty();
			const result = fmapId(argument);
			const expected = identity(argument);
			expect(result.toArray()).toEqual(expected.toArray());
			expect(result.toArray()).toEqual([]);
		});
    });
    
    describe('Functor second law: fmap (f . g) = fmap f . fmap g', () => {
		const p1 = (x) => x + 2;
		const p2 = (x) => x * 3;
		const ab = compose(p1, p2);
		const fA = partial(functor.fmap, [p1]);
		const fB = partial(functor.fmap, [p2]);
		const fAB = partial(functor.fmap, [ab]);
		const fAfB = compose(fA, fB);
		
		it('non empty list', () => {
            const result1 = fAB(a).toArray();
			const result2 = fAfB(a).toArray();
			expect(result1).toEqual(result2);
			expect(result1).toEqual([5, 8, 11]);
		});

		it('empty list', () => {
			const argument = List.empty();
			const result1 = fAB(argument).toArray();
			const result2 = fAfB(argument).toArray();
			expect(result1).toEqual(result2);
			expect(result1).toEqual([]);
		});		
	});
});