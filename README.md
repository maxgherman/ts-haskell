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
              |             +-------------+
              v                  |
        +-------------+          v
        | Applicative | ───────► +------+
        +-------------+          | Monad|
                                 +------+
                                   ^
                                   :
                                   :............................ (Monad as a monoid
 in endofunctors)
```

## Instances

`✓` = available instance  
`*` = requires the underlying value type to have the same instance

```
Type        Functor Applicative Monad Semigroup Monoid
------------------------------------------------------
Maybe          ✓        ✓         ✓        ✓*     ✓*
Either e       ✓        ✓         ✓        ✓*     ✓*
List           ✓        ✓         ✓        ✓      ✓
NonEmpty       ✓        ✓         ✓        ✓      -
Reader r       ✓        ✓         ✓        ✓*     ✓*
Writer w       ✓        ✓         ✓        ✓*     ✓*
(->) r         ✓        ✓         ✓        ✓*     ✓*
Tuple2 a       ✓        ✓         ✓        ✓*     ✓*
Promise        ✓        ✓         ✓        ✓*     ✓*
Unit ()        -        -         -        ✓      ✓
```

## References

- Functor
- Applicative
- Monad
- Semigroup
- Monoid
- Maybe
- Either
- List
- NonEmpty list
- Reader
- Writer
- Function arrow `(->)`
- Tuple2 and Unit
- Promise
