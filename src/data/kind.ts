export type Type = "*";

export type Constraint = "Constraint";

export type Kind1 =
  | Type // any monomorphic type (lifted, boxed values)
  | ((_: Type) => Constraint); // ex. Num

export type Kind2 =
  | ((_: Type) => Type) // ex. []
  | ((_: Type) => (_: Type) => Constraint); // ex. Functor

export type Kind3 = ((_: Type) => (_: Type) => Type); // ex. (,), Either

export type Kind =
  | Kind1
  | Kind2
  | Kind3;

export type Box<K extends Kind, _> = {
  readonly kind: K;
};

export type Box0<T> = Box<Kind1, T>;

export type Box1<T> = Box<Kind2, T>;

export type Box2<T> = Box<Kind3, T>;

export type MinBox0<T> = Box<Kind1 | Kind2 | Kind3, T>;

export type MinBox1<T> = Box<Kind2 | Kind3, T>;
