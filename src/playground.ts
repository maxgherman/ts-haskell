import { functor as plf } from '@control/functor/plain-array';
import { functor as baf } from '@control/functor/boxed-array';
import { functor as mbf } from '@control/functor/maybe';
import { functor as eif } from '@control/functor/either';

import { applicative as pla } from '@control/applicative/plain-array';
import { applicative as baa } from '@control/applicative/boxed-array';
import { applicative as mba } from '@control/applicative/maybe';

import { BoxedArray } from '@data/boxed-array';
import { Maybe } from '@data/maybe';
import { Either } from '@data/either';

plf.fmap(x => ({ a: x.a + 1}), [{a:1}, {a:2}, {a:3}]);

baf.fmap(x => ({ a: x.a + 1}), BoxedArray.from([{a:1}, {a:2}, {a:3}]));

mbf.fmap(x => ({ a: x.a + 1}), Maybe.just({a:1}));

eif<string>().fmap(x => ({ a: x.a + 1}), Either.right({a:1}));

pla.lift([x => x + 1], [1, 2, 3]);

baa.lift(BoxedArray.from([x => x + 1]), BoxedArray.from([1, 2, 3]));

mba.lift(Maybe.just(x => ({ a: x.b + 1})), Maybe.from({a: 1}));

//mba.
