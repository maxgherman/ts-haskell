const dot = f => g => (...args) => f(g(...args))

const applyReverse = (a) => (f) => f(a)

export {
    dot,
    applyReverse
}