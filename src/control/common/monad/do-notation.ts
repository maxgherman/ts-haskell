import { IMonad } from './monad';

export const doSingle = <R>(generator: () => IterableIterator<R>, monad: IMonad<{}>) => {
    const result = generator();

    const iteration = function(element) {
        const next = result.next(element);

        return next.done ?
            (monad.isOfType(next.value) ? next.value : monad.return(next.value)) :
            monad[">>="](next.value, iteration);
    };

    return iteration(null);
};

export const doRepeat = <R>(generator: () => IterableIterator<R>, monad: IMonad<{}>): R => {
    const iteration = (element, state) => {
        const result = generator();
        
        state.forEach((self) => result.next(self));
       
        const next = result.next(element);

        return next.done ?
            (monad.isOfType(next.value) ? next.value : monad.return(next.value))
            :
            monad[">>="](next.value, (value) =>
                iteration(value, state.concat(element))
            );
    };
    
    return iteration(null, []);
};
