import { IMonad } from './monad';

// var Do = function(gen, m) {
//     var doing = gen();
//     var doRec = function(v){
//         var a = doing.next(v);
//         if(a.done) {
//             return m.of(a.value);
//         } else {
//             return a.value.chain(doRec);
//         }
//     };
//     return doRec(null);
// };

export const doRepeat = <R>(generator: () => IterableIterator<R>, monad: IMonad<{}>): R => {
    const iteration = (element, state) => {
        const result = generator();
        
        state.forEach((it) => result.next(it));
       
        const next = result.next(element);

        if(next.done) {
            return next.value;
        } else {
            return monad['>>='](next.value, (value) =>
                iteration(value, state.concat(element))
            );
        }
    };
    
    return iteration(null, []);
};
