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