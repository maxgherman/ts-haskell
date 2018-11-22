import { semigroup as pas } from '@control/semigroup/plain-array';
import { semigroup as ps } from '@control/semigroup/promise';

import { monoid as plm } from '@control/monoid/plain-array';
import { monoid as lm } from '@control/monoid/list';
import { monoid as pm } from '@control/monoid/promise';

import { functor as plf } from '@control/functor/plain-array';
import { functor as baf } from '@control/functor/boxed-array';
import { functor as lf } from '@control/functor/list';
import { functor as mbf } from '@control/functor/maybe';
import { functor as eif } from '@control/functor/either';
import { functor as prf } from '@control/functor/plain-reader';
import { functor as rf } from '@control/functor/reader';
import { functor as wf } from '@control/functor/writer';
import { functor as pf } from '@control/functor/promise';

import { applicative as pla } from '@control/applicative/plain-array';
import { applicative as baa } from '@control/applicative/boxed-array';
import { applicative as la } from '@control/applicative/list';
import { applicative as mba } from '@control/applicative/maybe';
import { applicative as eia } from '@control/applicative/either';
import { applicative as pra } from '@control/applicative/plain-reader';
import { applicative as ra } from '@control/applicative/reader';
import { applicative as wa} from '@control/applicative/writer';

import { BoxedArray } from '@data/boxed-array';
import { List } from '@data/list';
import { Maybe } from '@data/maybe';
import { Either } from '@data/either';
import { Reader } from '@data/reader';
import { Writer } from '@data/writer';

ps(pas)["<>"](Promise.resolve([1]), new Promise(resolve => { resolve([1]); }));


plm.mappend<number>([1,2, 3], [1, 2, 3]);

lm.mappend<number>(List.single(1)[":"](3), List.single(2));

pm(plm).mappend(Promise.resolve([1]), new Promise(resolve => { resolve([1]); }));

plf.fmap(x => ({ a: x.a + 1}), [{a:1}, {a:2}, {a:3}]);

baf.fmap(x => ({ a: x.a + 1}), BoxedArray.from([{a:1}, {a:2}, {a:3}]));

lf.fmap(x => x.toUpperCase(), List.single('1'));

mbf.fmap(x => ({ a: x.a + 1}), Maybe.just({a:1}));

eif<string>().fmap(x => ({ a: x.a + 1}), Either.right({a:1}));

prf<number>().fmap((x: number) => x + 1, (x) => x * 2);

rf<number>().fmap(x => x + 1, Reader.from((x) => x + '2'));

wf<string[]>(plm).fmap((x) => x.toLowerCase(), Writer.from(['a', ['Test']]));

pf.fmap(x => x.toUpperCase(), new Promise<string>(resolve => resolve('')));


pla.lift([x => x + 1], [1, 2, 3]);

baa.lift(BoxedArray.from([x => x + 1]), BoxedArray.from([1, 2, 3]));

la.lift(List.single<(x:number) => number>(x => x + 1), List.single(1)[':'](2)[':'](3));

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

wa<string[]>(plm).lift(Writer.from([(x: string) => x.toLowerCase() + 1, ['Test']]), Writer.from(['1', ['Test1']]));