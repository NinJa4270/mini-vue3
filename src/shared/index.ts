export const isObject = (val: unknown): val is Record<any, any> =>
    val !== null && typeof val === 'object'


export const hasChanged = (value: any, oldValue: any): boolean =>
    !Object.is(value, oldValue)

export const isString = (val: unknown): val is string => typeof val === 'string'

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (
    val: object,
    key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key)

export const EMPTY_OBJ = {}

export const isArray = Array.isArray
export const isFunction = (val: unknown): val is Function =>
    typeof val === 'function'
export const objectToString = Object.prototype.toString

export const isMap = (val: unknown): val is Map<any, any> =>
    toTypeString(val) === '[object Map]'
export const toTypeString = (value: unknown): string =>
    objectToString.call(value)

export const isSet = (val: unknown): val is Set<any> =>
    toTypeString(val) === '[object Set]'

export const isPlainObject = (val: unknown): val is object =>
    toTypeString(val) === '[object Object]'


export * from './toDisplayString'