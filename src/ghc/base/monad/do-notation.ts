import { MinBox1 } from 'data/kind'
import { Monad } from './monad'

export const doNotation = <R extends MinBox1<R>>(generator: () => Generator, monad: Monad): R => {
    const iteration = (element: unknown, state: unknown[]): R => {
        const result = generator()

        state.forEach((self: unknown) => result.next(self))

        const next = result.next(element)

        if (next.done) {
            return monad.return(next.value) as R
        }

        return monad['>>='](next.value as MinBox1<unknown>, (value) => iteration(value, state.concat(element))) as R
    }

    return iteration(null as unknown, [])
}
