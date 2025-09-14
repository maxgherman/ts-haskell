export type Type = '*'

export type Constraint = 'Constraint'

export type Kind1 =
    | Type // any monomorphic type (lifted, boxed values)
    | ((_: Type) => Constraint) // ex. Num

export type Kind2 =
    | ((_: Type) => Type) // ex. []
    | ((_: (_: '*') => '*') => Constraint) // ex. Functor

export type Kind3 = (_: Type) => (_: Type) => Type // ex. (,), Either

// Higher-kinded constraint over a binary type constructor, e.g. Bifunctor
export type KindC3 = (_: (_: '*') => (_: '*') => '*') => Constraint

// Higher-kinded constraint over a transformer constructor t
// t :: (* -> *) -> * -> *
export type KindCTrans = (_: (_: (_: '*') => '*') => (_: '*') => '*') => Constraint

export type Kind = Kind1 | Kind2 | Kind3 | KindC3 | KindCTrans

export type Box<K extends Kind, _> = {
    readonly kind: K
}

type BuildBox<Ts extends unknown[] = []> = Ts extends { length: 0 }
    ? Box<Kind1, Ts>
    : Ts extends { length: 1 }
      ? Box<Kind2, Ts>
      : Ts extends { length: 2 }
        ? Box<Kind3, Ts>
        : never

export type Box0 = BuildBox<[]>

export type Box1<T> = BuildBox<[T]>

export type Box2<T1, T2> = BuildBox<[T1, T2]>

export type MinBox0<T> = Box<Kind1 | Kind2 | Kind3, T>

export type MinBox1<T> = Box<Kind2 | Kind3, T>
