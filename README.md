# ts-haskell
Mapping Haskell typeclasses to typescript

```bash
npm i
npm run lint
npm run build
npm test
```

## Typeclass relationships

```
+-----------+          +-----------+
| Semigroup | ───────► |  Monoid   |
+-----------+          +-----------+
                          : \
                          :  \............................ (Applicative as a monoidal pattern)
                          :   \
        +----------+      :    v
        | Functor  | ─────► +-------------+
        +----------+        | Applicative |
           |   |            +-------------+
           v   v               |
     +-------------+        +------+
     |  Comonad    |        | Monad|
     +-------------+        +------+
           |                 ^
           v                 :
     +------------------+    :............................ (Monad as a monoid
     | Comonad Apply    |                             in endofunctors)
     +------------------+
```

## Instances

`✓` = available instance
`*` = requires the underlying value type to have the same instance

```
Type        Functor Applicative Monad Comonad ComonadApply Semigroup Monoid
----------------------------------------------------------------------------
Maybe          ✓        ✓         ✓      -        -           ✓*     ✓*
Either e       ✓        ✓         ✓      -        -           ✓*     ✓*
List           ✓        ✓         ✓      -        -           ✓      ✓
NonEmpty       ✓        ✓         ✓      ✓        ✓           ✓      -
Reader r       ✓        ✓         ✓      ✓        ✓           ✓*     ✓*
Writer w       ✓        ✓         ✓      ✓        ✓           ✓*     ✓*
(->) r         ✓        ✓         ✓      ✓        ✓           ✓*     ✓*
Tuple2 a       ✓        ✓         ✓      ✓        ✓           ✓*     ✓*
Promise        ✓        ✓         ✓      -        -           ✓*     ✓*
Unit ()        -        -         -      -        -           ✓      ✓
```

## References

- [Functor](src/ghc/base/functor.ts)
- [Applicative](src/ghc/base/applicative.ts)
- [Monad](src/ghc/base/monad/monad.ts)
- [Comonad](src/control/comonad.ts)
- [ComonadApply](src/control/comonad-apply.ts)
- [Semigroup](src/ghc/base/semigroup.ts)
- [Monoid](src/ghc/base/monoid.ts)
- [Maybe](src/ghc/base/maybe/maybe.ts)
- [Either](src/data/either/either.ts)
- [List](src/ghc/base/list/list.ts)
- [NonEmpty list](src/ghc/base/non-empty/list.ts)
- [Reader](src/control/reader/reader.ts)
- [Writer](src/control/writer/writer.ts)
- [Function arrow \`(->)\`](src/ghc/prim/function-arrow/index.ts)
- [Tuple2 and Unit](src/ghc/base/tuple/tuple.ts)
- [Promise](src/extra/promise/promise.ts)
