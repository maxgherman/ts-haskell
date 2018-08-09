import { compose } from 'ramda';
import { Application } from '@common/types/applicative';

export class Reader<T, A> {
    private _action: Application<T, A>;
    
    private constructor(action: Application<T, A>) {
        this._action = action;
        this.runReader = this.runReader.bind(this);
    }

    public static from<T, A>(action: Application<T, A>): Reader<T, A> {
        return new Reader(action);
    }

    public runReader(e: T): A {
        return this._action(e);
    }

    // mapReader :: (a -> b) -> Reader r a -> Reader r b
    public mapReader<B>(app: Application<A, B>): Reader<T, B> {
        return Reader.from(compose(app, this.runReader));
    }

    // withReader :: :: (r' -> r) -> Reader r a	 -> Reader r' a
    public withReader<K>(app: Application<K, T>) {
        return Reader.from(compose(this.runReader, app));
    }
}