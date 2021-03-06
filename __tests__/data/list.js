import { compose, uncurryN, flip } from 'ramda';
import { List, cons, concat } from '@data/list';

describe('List', () => {
    const testCons = flip(uncurryN(2, cons));
    const testConcat = flip(uncurryN(2, concat));
    const empty = List.empty();
  
    it('empty', () => {
        expect(empty.isEmpty).toBe(true);
        expect(empty.isSingle).toBe(false);
        expect(empty.head).toBe(null);
    });

    it('single', () => {
        const list = List.single(0);
        expect(list.isSingle).toBe(true);
        expect(list.isEmpty).toBe(false);
        expect(list.head).toBe(0);
    });

    it('map', () => {
        const list = ((empty[':'](3))[':'](2))[':'](1);
        const result = list.map(x => x * 2);

        expect(result.toArray()).toEqual([2, 4, 6]);
    });

    describe('reduce', () => {
        it('empty', () => {
            const list = List.empty();
            const result = list.reduce((acc, curr) => acc + curr * curr, 1);

            expect(result).toBe(1);
        });

        it('non empty', () => {
            const list = ((empty[':'](3))[':'](2))[':'](1);
            const result = list.reduce((acc, curr) => acc[':'](curr), List.empty());

            expect(result.head).toBe(3);
            expect(result.tail.head).toBe(2);
            expect(result.tail.tail.head).toBe(1);
            expect(result.tail.tail.isSingle).toBe(true);
        });
    });

    describe('reduceRight', () => {
        it('empty', () => {
            const list = List.empty();
            const result = list.reduceRight((acc, curr) => acc + curr * curr, 1);

            expect(result).toBe(1);
        });

        it('non empty', () => {
            const list = ((empty[':'](3))[':'](2))[':'](1);
            const result = list.reduceRight((acc, curr) => acc[':'](curr), List.empty());

            expect(result.head).toBe(1);
            expect(result.tail.head).toBe(2);
            expect(result.tail.tail.head).toBe(3);
            expect(result.tail.tail.isSingle).toBe(true);
        });
    });

    describe(':', () => {
        it('single', () => {
            const list = empty[':'](123);
            
            expect(list.head).toBe(123);
            expect(list.isSingle).toBe(true);
        });

        it('multiple', () => {
            const list = ((empty[':'](123))[':'](4))[':'](5);
            
            expect(list.toArray()).toEqual([5, 4, 123]);
        });

        it('multiple compose', () => {
            const list = compose(
                testCons(5),
                testCons(4),
                testCons(123)
            )(empty);
            
            expect(list.toArray()).toEqual([5, 4, 123]);
         });
    });

    describe('++', () => {
        const a = compose(
            testCons(1),
            testCons(2),
            testCons(3)
        )(empty);

        const b = compose(
            testCons(4),
            testCons(5),
            testCons(6)
        )(empty);
        
        it('empty first arg', () => {
            const list = List.single(123);
            const result = empty['++'](list);

            expect(result).toBe(list);
            expect(result.head).toBe(123);
        });

        it('empty second arg', () => {
            const list = List.single(123);
            const result = list['++'](empty);

            expect(result === list).toBe(false);
            expect(result.head).toBe(123);
        });

        it('empty empty', () => {
            const list = List.empty();
            const result = list['++'](empty);

            expect(result.isEmpty).toBe(true);
        });

        it('non empty', () => {
            const a = ((empty[':'](3))[':'](2))[':'](1);
            const b = ((empty[':'](6))[':'](5))[':'](4);

            const result = a['++'](b);

            expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
        });

        it('non empty compose', () => {
            const result = a['++'](b);

            expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6]);
        });

        it('non empty compose concat', () => {
            const c = List.single(8)[':'](7);
            
            const result = compose(
                testConcat(c),
                testConcat(b),
            )(a);


            expect(result.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
        });
    });

    describe('iterator protocol', () => {
        it('returns empty', () => {
            const list = List.empty();
            const iterator = list[Symbol.iterator]();
            const result = iterator.next();

            expect(result.done).toBe(true);
            expect(result.value).toBe(undefined);
        });

        it('returns non empty', () => {
            const list = ((empty[':'](3))[':'](2))[':'](1);
            const iterator = list[Symbol.iterator]();

            let result = iterator.next();
            const acc = [];

            while(!result.done) {
                acc.push(result.value);
                result = iterator.next();
            }

            expect(acc).toEqual(list.toArray());
        });

        it('returns spread', () => {
            const list = ((empty[':'](3))[':'](2))[':'](1);
            const result = [...list];
            
            expect(result).toEqual(list.toArray());
        });
    });
 });