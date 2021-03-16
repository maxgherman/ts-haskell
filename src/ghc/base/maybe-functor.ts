import { $case, just, MaybeBox, nothing } from "./maybe.ts";
import { FMap, Functor, functor as createFunctor } from "./functor.ts";

export interface MaybeFunctor extends Functor {
  fmap<A, B>(f: (a: A) => B, fa: MaybeBox<A>): MaybeBox<B>;

  "<$>"<A, B>(f: (a: A) => B, fa: MaybeBox<A>): MaybeBox<B>;

  "<$"<A, B>(a: A, fb: MaybeBox<B>): MaybeBox<A>;

  "$>"<A, B>(fa: MaybeBox<A>, b: B): MaybeBox<B>;

  "<&>"<A, B>(fa: MaybeBox<A>, f: (a: A) => B): MaybeBox<B>;

  void<A>(fa: MaybeBox<A>): MaybeBox<[]>;
}

const fmap: FMap = {
  // fmap :: MaybeBox f => (a -> b) ->  f a -> f b
  fmap: <A, B>(f: (a: A) => NonNullable<B>, fa: MaybeBox<A>) =>
    $case({
      nothing,
      just: (x: A) => just(f(x)),
    })(fa) as MaybeBox<B>,
};

export const functor = createFunctor(fmap) as MaybeFunctor;
