import { compose, partial, flip } from 'ramda';
import { List } from '@data/list';
import { monoid } from '@control/monoid/list';

describe('List monoid', () => {
    const a = List.empty()[':'](3)[':'](2)[':'](1);
    const b = List.empty()[':'](6)[':'](5)[':'](4);
    
    describe('mempty', () => {
        it('returns empty list', () => {
            const result = monoid.mempty();
            expect(result.isEmpty).toBe(true);
            expect(result.toArray()).toEqual([]);
        })
    });

    describe('mappend', () => {
        it('returns concat', () => {
            const result = monoid.mappend(a, b);
            expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
        })

        it('uses mempty for falsy first arg', () => {
            const result = monoid.mappend(undefined, b);
            expect(result.toArray()).toEqual([4, 5, 6]);
        })

        it('uses mempty for falsy second arg', () => {
            const result = monoid.mappend(a, undefined);
            expect(result.toArray()).toEqual([1, 2, 3]);
        })

        it('uses mempty for falsy second arg', () => {
            const result = monoid.mappend(undefined, undefined);
            expect(result.isEmpty).toBe(true);
            expect(result.toArray()).toEqual([]);
        })
    });

    describe('mconcat', () => {
        it('flattens right array', () => {
            const result = monoid.mconcat([ a, b ]);
            expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
        })

        it('uses mempty for falsy arg', () => {
            const result = monoid.mconcat(undefined);
            expect(result.toArray()).toEqual([]);
        })
    });

    describe('Monoid first law (Identity): x <> mempty = x', () => {
        it('non empty array', () => {
            const result = monoid['<>'](a, monoid.mempty());
            expect(result.toArray()).toEqual(a.toArray());
        })

        it('empty array', () => {
            const arg = List.empty();

            const result = monoid['<>'](arg, monoid.mempty());
            expect(result.toArray()).toEqual(arg.toArray());
        })
    });

    describe('Monoid second law (Associativity): (a <> b) <> c == a <> (b <> c)', () => {
        it('non empty array', () => {
            const param1 = List.empty()[':'](2)[':'](1);
            const param2 = List.empty()[':'](4)[':'](3);
            const param3 = List.empty()[':'](6)[':'](5);
            
            const result1 = monoid['<>'](monoid['<>'](param1, param2), param3);
            const result2 = monoid['<>'](param1, monoid['<>'](param2, param3));
            expect(result1.toArray()).toEqual(result2.toArray());
            expect(result1.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
        })

        it('empty array', () => {
            const param1 = List.empty();
            const param2 = List.empty();
            const param3 = List.empty();

            const result1 = monoid['<>'](monoid['<>'](param1, param2), param3);
            const result2 = monoid['<>'](param1, monoid['<>'](param2, param3));
            expect(result1.toArray()).toEqual(result2.toArray());
            expect(result1.toArray()).toEqual([]);
        })

        it('with compose', () => {
            const param1 = List.empty()[':'](2)[':'](1);
            const param2 = List.single(3);
            const param3 = List.empty()[':'](6)[':'](5);

            const result1 = compose(
                partial(flip(monoid['<>']), [param3]),
                partial(monoid['<>'], [param1])
            )(param2);

            const result2 = compose(
                partial(monoid['<>'], [param1]),
                partial(monoid['<>'], [param2])
            )(param3);

            expect(result1.toArray()).toEqual(result2.toArray());
            expect(result1.toArray()).toEqual([1, 2, 3, 5, 6]);
        })
    });
});