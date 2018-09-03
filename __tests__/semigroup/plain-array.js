import { semigroup } from '@control/semigroup/plain-array';

describe('PlainArray semigroup', () => {
    describe('<>', () => {
        it('returns concat', () => {
            const result = semigroup['<>']([1, 2 ,3], [4, 5, 6]);
            expect(result).toEqual([1, 2, 3, 4, 5, 6]);
        }),

        it('uses plain array for falsy first arg', () => {
            const result = semigroup['<>'](undefined, [4, 5, 6]);
            expect(result).toEqual([4, 5, 6]);
        }),

        it('uses plain array for falsy second arg', () => {
            const result = semigroup['<>']([1, 2, 3], undefined);
            expect(result).toEqual([1, 2, 3]);
        }),

        it('uses plain array for falsy args', () => {
            const result = semigroup['<>'](undefined, undefined);
            expect(result).toEqual([]);
        })  
    })
});