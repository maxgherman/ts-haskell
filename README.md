# ts-haskell
Mapping Haskell typeclasses to TypeScript

```bash
npm i
npm run lint
npm run build
npm test
```

## Typeclass relationships

```txt
                +-----------+                +----------+
                | SEMIGROUP | -------------->│  MONOID  │ ------------|  ............ (Applicative as a monoidal pattern)

                +-----------+                +----------+             v
                                                              +--------------+
                       |------------------------------------- | APPLICATIVE  │
                       |                                      +--------------+
                       |                                              |
                       v                                              v
            +-----------+            +--------+       +------------+ +--------------+
            │   MONAD   │ <--------- │FUNCTOR │-----> │  COMONAD   │ │ ALTERNATIVE  │
            +-----------+            +--------+       +------------+ +--------------+
               \\                                                         |
                \\                                                        v
                 \\------------------------------------------------> +--------------+
                                                                    │  MONADPLUS   │
                                                                    +--------------+
                           .              | ----------\
   (Monad as a monoid      .              v            \     +-------------+
    in endofunctors) .......    +--------------+        \--> | TRAVERSABLE │
                                │   FOLDABLE   │ ------/     +-------------+
                                +--------------+
```

## Instances

- `✓` = available instance
- `*` = requires the underlying value type to have the same instance

| Type       | Functor | Applicative | Alternative | Monad | MonadPlus | Comonad | ComonadApply | Foldable | Traversable | Semigroup | Monoid |
| ---------- | :-----: | :---------: | :---------: | :---: | :-------: | :-----: | :----------: | :------: | :---------: | :-------: | :----: |
| Maybe      | ✓       | ✓           | ✓           | ✓     | ✓         |         |              | ✓        | ✓           | ✓*        | ✓*  |
| Either e   | ✓       | ✓           | ✓*          | ✓     | ✓*        |         |              | ✓        | ✓           | ✓*        | ✓*  |
| List       | ✓       | ✓           | ✓           | ✓     | ✓         |         |              | ✓        | ✓           | ✓         | ✓  |
| NonEmpty   | ✓       | ✓           |             | ✓     |           | ✓       | ✓            | ✓        | ✓           | ✓         |  |
| Reader r   | ✓       | ✓           |             | ✓     |           | ✓       | ✓            | ✓        | ✓           | ✓*        | ✓*  |
| Writer w   | ✓       | ✓           |             | ✓     |           | ✓       | ✓            | ✓        | ✓           | ✓*        | ✓*  |
| State s    | ✓       | ✓           |             | ✓     |           |         |              |          |             |           |  |
| (->) r     | ✓       | ✓           |             | ✓     |           | ✓       | ✓            | ✓        | ✓           | ✓*        | ✓*  |
| Tuple2 a   | ✓       | ✓           |             | ✓     |           | ✓       | ✓            | ✓        | ✓           | ✓*        | ✓*  |
| Promise    | ✓       | ✓           |             | ✓     |           |         |              | ✓        |             | ✓*        | ✓*  |
| Unit ()    |         |             |             |       |           |         |              |          |             | ✓         | ✓  |

## References

- [Functor](src/ghc/base/functor.ts)
- [Applicative](src/ghc/base/applicative.ts)
- [Alternative](src/control/alternative/alternative.ts)
- [Monad](src/ghc/base/monad/monad.ts)
- [MonadPlus](src/control/monad-plus/monad-plus.ts)
- [Comonad](src/control/comonad.ts)
- [ComonadApply](src/control/comonad-apply.ts)
- [Foldable](src/data/foldable.ts)
- [Traversable](src/data/traversable.ts)
- [Semigroup](src/ghc/base/semigroup.ts)
- [Monoid](src/ghc/base/monoid.ts)
- [Maybe](src/ghc/base/maybe/maybe.ts) ([Alternative](src/ghc/base/maybe/alternative.ts), [MonadPlus](src/control/monad-plus/maybe.ts), [Foldable](src/ghc/base/maybe/foldable.ts), [Traversable](src/ghc/base/maybe/traversable.ts))
- [Either](src/data/either/either.ts) ([Alternative](src/data/either/alternative.ts), [MonadPlus](src/control/monad-plus/either.ts), [Foldable](src/data/either/foldable.ts), [Traversable](src/data/either/traversable.ts))
- [List](src/ghc/base/list/list.ts) ([Alternative](src/ghc/base/list/alternative.ts), [MonadPlus](src/control/monad-plus/list.ts), [Foldable](src/ghc/base/list/foldable.ts), [Traversable](src/ghc/base/list/traversable.ts))
- [NonEmpty list](src/ghc/base/non-empty/list.ts) ([Comonad](src/ghc/base/non-empty/comonad.ts), [ComonadApply](src/ghc/base/non-empty/comonad-apply.ts), [Foldable](src/ghc/base/non-empty/foldable.ts), [Traversable](src/ghc/base/non-empty/traversable.ts))
- [Reader](src/control/reader/reader.ts) ([Comonad](src/control/reader/comonad.ts), [ComonadApply](src/control/reader/comonad-apply.ts), [Foldable](src/control/reader/foldable.ts), [Traversable](src/control/reader/traversable.ts))
- [Writer](src/control/writer/writer.ts) ([Comonad](src/control/writer/comonad.ts), [ComonadApply](src/control/writer/comonad-apply.ts), [Foldable](src/control/writer/foldable.ts), [Traversable](src/control/writer/traversable.ts))
- [State](src/control/state/state.ts) ([Functor](src/control/state/functor.ts), [Applicative](src/control/state/applicative.ts), [Monad](src/control/state/monad.ts))
- [Function arrow `(->)`](src/ghc/prim/function-arrow/index.ts) ([Comonad](src/control/reader/comonad.ts), [ComonadApply](src/control/reader/comonad-apply.ts), [Foldable](src/control/reader/foldable.ts), [Traversable](src/control/reader/traversable.ts))
- [Tuple2 and Unit](src/ghc/base/tuple/tuple.ts) ([Comonad](src/ghc/base/tuple/tuple2-comonad.ts), [ComonadApply](src/ghc/base/tuple/tuple2-comonad-apply.ts), [Foldable](src/ghc/base/tuple/foldable.ts), [Traversable](src/ghc/base/tuple/tuple2-traversable.ts))
- [Promise](src/extra/promise/promise.ts) ([Foldable](src/extra/promise/foldable.ts), [Semigroup](src/extra/promise/semigroup.ts), [Monoid](src/extra/promise/monoid.ts))
