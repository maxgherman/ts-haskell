import { functor as plf } from '@control/functor/plain-array';
import { functor as baf } from '@control/functor/boxed-array';
import { functor as mbf } from '@control/functor/maybe';
import { functor as eif } from '@control/functor/either';
import { functor as prf } from '@control/functor/plain-reader';
import { functor as rf } from '@control/functor/reader';

import { applicative as pla } from '@control/applicative/plain-array';
import { applicative as baa } from '@control/applicative/boxed-array';
import { applicative as mba } from '@control/applicative/maybe';
import { applicative as eia } from '@control/applicative/either';
import { applicative as pra } from '@control/applicative/plain-reader';
import { applicative as ra } from '@control/applicative/reader';

import { BoxedArray } from '@data/boxed-array';
import { Maybe } from '@data/maybe';
import { Either } from '@data/either';
import { Reader } from '@data/reader';

plf.fmap(x => ({ a: x.a + 1}), [{a:1}, {a:2}, {a:3}]);

baf.fmap(x => ({ a: x.a + 1}), BoxedArray.from([{a:1}, {a:2}, {a:3}]));

mbf.fmap(x => ({ a: x.a + 1}), Maybe.just({a:1}));

eif<string>().fmap(x => ({ a: x.a + 1}), Either.right({a:1}));

prf<number>().fmap((x: number) => x + 1, (x) => x * 2);

rf<number>().fmap(x => x + 1, Reader.from((x) => x + '2'));

pla.lift([x => x + 1], [1, 2, 3]);

baa.lift(BoxedArray.from([x => x + 1]), BoxedArray.from([1, 2, 3]));

mba.lift(Maybe.just((x: { a: number}) => ({ a: x.a + 1})), Maybe.from({a: 1}));

// mba.lift(Maybe.just((x: number) => x + 1), Maybe.from('2'));

eia<string>().lift(Either.right((x: { a: number}) => ({ a: x.a + 1})), Either.right({a  : 1}));

// eia<string>().lift(Either.right((x: number) => x + 1), Either.right('2'));

// pra<number>().lift((r: number) => (x: number) => r *3 + x, (x) => x + '1');
pra<{ a : number }>().lift((r) => (x: number) => r.a + x, (x) => x.a + 1);
const prat = pra<{ a : number}>().fmap((x: number) => (y: number) => x + y,
    (x: { a : number }): number => x.a * 3);
pra<{ a : number }>().lift(prat, (x) => x.a + 1);

ra<{a : number }>().lift(Reader.from((r) => (x) => r.a + x), Reader.from((x) => x.a + 1));

