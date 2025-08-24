# ts-haskell
Mapping Haskell typeclasses to typescript

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
                       |                                              ^
                       v                  |---------------------------|
            +-----------+            +--------+       +------------+      +---------------+
            │   MONAD   │ <--------- │FUNCTOR │-----> │  COMONAD   │----> │ COMONAD APPLY │
            +-----------+  .         +--------+       +------------+      +---------------+
                           .              |
                           .              | ----------\
   (Monad as a monoid      .              v            \     +-------------+
    in endofunctors) .......    +--------------+        \--> | TRAVERSABLE │
                                │   FOLDABLE   │ ------/     +-------------+
                                +--------------+
```

## Instances

`✓` = available instance
`*` = requires the underlying value type to have the same instance

| Type       | Functor | Applicative | Alternative | Monad | Comonad | ComonadApply | Foldable | Traversable | Semigroup | Monoid |
| ---------- | :-----: | :---------: | :---------: | :---: | :-----: | :----------: | :------: | :---------: | :-------: | :----: |
| Maybe      | ✓       | ✓           | ✓           | ✓     |         |              | ✓        | ✓           | ✓*        | ✓*     |
| Either e   | ✓       | ✓           | -           | ✓     |         |              | ✓        | ✓           | ✓*        | ✓*     |
| List       | ✓       | ✓           | ✓           | ✓     |         |              | ✓        | ✓           | ✓         | ✓      |
| NonEmpty   | ✓       | ✓           |             | ✓     | ✓       | ✓            | ✓        | ✓           | ✓         |        |
| Reader r   | ✓       | ✓           |             | ✓     | ✓       | ✓            | ✓        |             | ✓*        | ✓*     |
| Writer w   | ✓       | ✓           |             | ✓     | ✓       | ✓            | ✓        |             | ✓*        | ✓*     |
| State s    | ✓       | ✓           |             | ✓     |         |              |          |             |           |        |
| (->) r     | ✓       | ✓           |             | ✓     | ✓       | ✓            | ✓        |             | ✓*        | ✓*     |
| Tuple2 a   | ✓       | ✓           |             | ✓     | ✓       | ✓            | ✓        | ✓           | ✓*        | ✓*     |
| Promise    | ✓       | ✓           |             | ✓     |         |              | ✓        |             | ✓*        | ✓*     |
| Unit ()    |         |             |             |       |         |              |          |             | ✓         | ✓      |

## References

- [Functor](src/ghc/base/functor.ts)
- [Applicative](src/ghc/base/applicative.ts)
- [Alternative](src/control/alternative/alternative.ts)
- [Monad](src/ghc/base/monad/monad.ts)
- [Comonad](src/control/comonad.ts)
- [ComonadApply](src/control/comonad-apply.ts)
- [Foldable](src/data/foldable.ts)
- [Traversable](src/data/traversable.ts)
- [Semigroup](src/ghc/base/semigroup.ts)
- [Monoid](src/ghc/base/monoid.ts)
- [Maybe](src/ghc/base/maybe/maybe.ts) ([Alternative](src/ghc/base/maybe/alternative.ts), [Foldable](src/ghc/base/maybe/foldable.ts), [Traversable](src/ghc/base/maybe/traversable.ts))
- [Either](src/data/either/either.ts) ([Foldable](src/data/either/foldable.ts), [Traversable](src/data/either/traversable.ts))
- [List](src/ghc/base/list/list.ts) ([Alternative](src/ghc/base/list/alternative.ts), [Foldable](src/ghc/base/list/foldable.ts), [Traversable](src/ghc/base/list/traversable.ts))
- [NonEmpty list](src/ghc/base/non-empty/list.ts) ([Foldable](src/ghc/base/non-empty/foldable.ts), [Traversable](src/ghc/base/non-empty/traversable.ts))
- [Reader](src/control/reader/reader.ts) ([Foldable](src/control/reader/foldable.ts))
- [Writer](src/control/writer/writer.ts) ([Foldable](src/control/writer/foldable.ts))
- [State](src/control/state/state.ts) ([Functor](src/control/state/functor.ts), [Applicative](src/control/state/applicative.ts), [Monad](src/control/state/monad.ts))
- [Function arrow `(->)`](src/ghc/prim/function-arrow/index.ts) ([Foldable](src/control/reader/foldable.ts))
- [Tuple2 and Unit](src/ghc/base/tuple/tuple.ts) ([Foldable](src/ghc/base/tuple/foldable.ts), [Traversable](src/ghc/base/tuple/tuple2-traversable.ts))
- [Promise](src/extra/promise/promise.ts) ([Foldable](src/extra/promise/foldable.ts))
