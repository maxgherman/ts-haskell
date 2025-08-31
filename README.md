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

+---------------+   (fix one arg)
|   BIFUNCTOR   |------ 
+---------------+     | 
                      v           
                 +-----------+           +-----------+                                     
       --------- |  FUNCTOR  | .......   | SEMiGROUP |                                 
       |      |  +-----------+       .   +-----------+                                                               
       v      |          |      ...............|.................. (Applicative as a monoidal pattern)
 +---------+  |          v      v    ....      v              
 | COMONAD |  |    +-------------+       .  +----------+               
 +---------+  |    | APPLICATIVE | ---|  .  |  MONOID  |        
              |    +-------------+    |  .  +----------+ 
        ------|            |          |  ..........................(Monad as a monoid in endofunctors)
        |                  v          |           v      
        |           +--------------+  |       +-----------+                                  
        |           │ ALTERNATIVE  │  |-----> │   MONAD   │                           
        |           +--------------+          +-----------+   
        v                                            |                          
  +-------------+       +--------------+             v
  | TRAVERSABLE |<------│   FOLDABLE   │         +--------------+
  +-------------+       +--------------+         |  MONADPLUS   │       
                                                 +--------------+       
```

## Instances

- `✓` = available instance
- `*` = requires the underlying value type to have the same instance

| Type       | Functor | Applicative | Alternative | Monad | MonadPlus | Bifunctor | Comonad | ComonadApply | Foldable | Traversable | Semigroup | Monoid |
| ---------- | :-----: | :---------: | :---------: | :---: | :-------: | :------: | :-----: | :----------: | :------: | :---------: | :-------: | :----: |
| Maybe      | ✓       | ✓           | ✓           | ✓     | ✓         |          |         |              | ✓        | ✓           | ✓*        | ✓*  |
| Either e   | ✓       | ✓           | ✓*          | ✓     | ✓*        | ✓        |         |              | ✓        | ✓           | ✓*        | ✓*  |
| List       | ✓       | ✓           | ✓           | ✓     | ✓         |          |         |              | ✓        | ✓           | ✓         | ✓  |
| NonEmpty   | ✓       | ✓           |             | ✓     |           |          | ✓       | ✓            | ✓        | ✓           | ✓         |  |
| Reader r   | ✓       | ✓           |             | ✓     |           |          | ✓       | ✓            | ✓        | ✓           | ✓*        | ✓*  |
| Writer w   | ✓       | ✓           |             | ✓     |           |          | ✓       | ✓            | ✓        | ✓           | ✓*        | ✓*  |
| State s    | ✓       | ✓           |             | ✓     |           |          |         |              |          |             |           |  |
| (->) r     | ✓       | ✓           |             | ✓     |           |          | ✓       | ✓            | ✓        | ✓           | ✓*        | ✓*  |
| Tuple2 a   | ✓       | ✓           |             | ✓     |           | ✓        | ✓       | ✓            | ✓        | ✓           | ✓*        | ✓*  |
| Promise    | ✓       | ✓           |             | ✓     |           |          |         |              | ✓        |             | ✓*        | ✓*  |
| Unit ()    |         |             |             |       |           |          |         |              |          |             | ✓         | ✓  |

## References

- [Functor](src/ghc/base/functor.ts)
- [Bifunctor](src/data/bifunctor.ts)
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
- [Maybe](src/ghc/base/maybe/maybe.ts) ([Functor](src/ghc/base/maybe/functor.ts), [Applicative](src/ghc/base/maybe/applicative.ts), [Alternative](src/ghc/base/maybe/alternative.ts), [Monad](src/ghc/base/maybe/monad.ts), [MonadPlus](src/control/monad-plus/maybe.ts), [Foldable](src/ghc/base/maybe/foldable.ts), [Traversable](src/ghc/base/maybe/traversable.ts))
- [Either](src/data/either/either.ts) ([Functor](src/data/either/functor.ts), [Applicative](src/data/either/applicative.ts), [Alternative](src/data/either/alternative.ts), [Monad](src/data/either/monad.ts), [MonadPlus](src/control/monad-plus/either.ts), [Bifunctor](src/data/either/bifunctor.ts), [Foldable](src/data/either/foldable.ts), [Traversable](src/data/either/traversable.ts))
- [List](src/ghc/base/list/list.ts) ([Functor](src/ghc/base/list/functor.ts), [Applicative](src/ghc/base/list/applicative.ts), [Alternative](src/ghc/base/list/alternative.ts), [Monad](src/ghc/base/list/monad.ts), [MonadPlus](src/control/monad-plus/list.ts), [Foldable](src/ghc/base/list/foldable.ts), [Traversable](src/ghc/base/list/traversable.ts))
- [NonEmpty list](src/ghc/base/non-empty/list.ts) ([Functor](src/ghc/base/non-empty/functor.ts), [Applicative](src/ghc/base/non-empty/applicative.ts), [Monad](src/ghc/base/non-empty/monad.ts), [Comonad](src/ghc/base/non-empty/comonad.ts), [ComonadApply](src/ghc/base/non-empty/comonad-apply.ts), [Foldable](src/ghc/base/non-empty/foldable.ts), [Traversable](src/ghc/base/non-empty/traversable.ts))
- [Reader](src/control/reader/reader.ts) ([Functor](src/control/reader/functor.ts), [Applicative](src/control/reader/applicative.ts), [Monad](src/control/reader/monad.ts), [Comonad](src/control/reader/comonad.ts), [ComonadApply](src/control/reader/comonad-apply.ts), [Foldable](src/control/reader/foldable.ts), [Traversable](src/control/reader/traversable.ts))
- [Writer](src/control/writer/writer.ts) ([Functor](src/control/writer/functor.ts), [Applicative](src/control/writer/applicative.ts), [Monad](src/control/writer/monad.ts), [Comonad](src/control/writer/comonad.ts), [ComonadApply](src/control/writer/comonad-apply.ts), [Foldable](src/control/writer/foldable.ts), [Traversable](src/control/writer/traversable.ts))
- [State](src/control/state/state.ts) ([Functor](src/control/state/functor.ts), [Applicative](src/control/state/applicative.ts), [Monad](src/control/state/monad.ts))
- [Function arrow `(->)`](src/ghc/prim/function-arrow/index.ts) ([Functor](src/ghc/base/function-arrow/functor.ts), [Applicative](src/ghc/base/function-arrow/applicative.ts), [Monad](src/ghc/base/function-arrow/monad.ts), [Comonad](src/control/reader/comonad.ts), [ComonadApply](src/control/reader/comonad-apply.ts), [Foldable](src/control/reader/foldable.ts), [Traversable](src/control/reader/traversable.ts))
- [Tuple2 and Unit](src/ghc/base/tuple/tuple.ts) ([Functor](src/ghc/base/tuple/tuple2-functor.ts), [Applicative](src/ghc/base/tuple/tuple2-applicative.ts), [Monad](src/ghc/base/tuple/tuple2-monad.ts), [Bifunctor](src/ghc/base/tuple/tuple2-bifunctor.ts), [Comonad](src/ghc/base/tuple/tuple2-comonad.ts), [ComonadApply](src/ghc/base/tuple/tuple2-comonad-apply.ts), [Foldable](src/ghc/base/tuple/foldable.ts), [Traversable](src/ghc/base/tuple/tuple2-traversable.ts), [Semigroup](src/ghc/base/tuple/tuple2-semigroup.ts), [Monoid](src/ghc/base/tuple/tuple2-monoid.ts))
- [Promise](src/extra/promise/promise.ts) ([Functor](src/extra/promise/functor.ts), [Applicative](src/extra/promise/applicative.ts), [Monad](src/extra/promise/monad.ts), [Foldable](src/extra/promise/foldable.ts), [Semigroup](src/extra/promise/semigroup.ts), [Monoid](src/extra/promise/monoid.ts))
