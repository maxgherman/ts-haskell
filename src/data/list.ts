import { identity } from 'ramda';

export class List<T> {
            
    private _isEmpty = false;

    private constructor(private _head: T, private _tail: List<T>) { }

    public get head(): T {
        return this._head;
    }

    public get tail(): List<T> {
        return this._tail;
    }

    public get isEmpty(): boolean {
        return this._isEmpty;
    }

    public get isSingle(): boolean {
        return !this.isEmpty && 
        this._tail === null || this._tail === undefined;
    }

    public static empty<R>(): List<R> {
        const result = new List(null, null) as List<R>;
        result._isEmpty = true; 
        return result;
    }

    public static single<R>(value: R): List<R> {
        return new List(value, null) as List<R>;
    }

    public ':'(value: T): List<T> {
        if(this.isEmpty) {
            return new List(value, null);
        }

        return new List(value, this);
    }
 
    public '++'(list: List<T>) {
    
        if(this.isEmpty) {
            return list;
        }
        
        const { result, bottom } = List.copy(this, identity);

        if(!list.isEmpty) {
            bottom._tail = list;    
        }

        return result;
    }

    public map<R>(f: (a:T) => R): List<R> {
        const { result } = List.copy(this, f);
        return result;
    }

    public toArray(): Array<T> {
        if(this.isEmpty) {
            return [];
        }
        
        const result = [];
        let current = this as List<T>;
        while(!current.isSingle) {
            result.push(current.head);
            current = current.tail;
        }

        result.push(current.head);

        return result;
    }

    private static copy<R1, R2>(list: List<R1>, f: (a:R1) => R2): { result: List<R2>, bottom: List<R2> } {
        
        if(list.isEmpty) {
            const result = List.empty<R2>();
            return { result, bottom: result }; 
        }

        if(list.isSingle) {
            const result = new List(f(list.head), null);
            return { result, bottom: result };
        }

        const { result, bottom } = List.copy(list.tail, f);
        
        return {
            result: new List(f(list.head), result.isEmpty ? null : result),
            bottom
        };
    }
}

export const cons = <T>(list: List<T>) => (value: T) =>
    list[":"](value);

export const concat = <T>(list1: List<T>) => (list2: List<T>) =>
    list1["++"](list2);