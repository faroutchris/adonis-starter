// Reflects declared properties on a class
type Newable = { new (...args: readonly unknown[]): unknown }
type AnyFn = (...args: unknown[]) => unknown
type ClassProperties<C extends Newable> = {
  [K in keyof InstanceType<C> as InstanceType<C>[K] extends AnyFn ? never : K]: InstanceType<C>[K]
}
type KeyOfType<Type, ValueType> = keyof {
  [Key in keyof Type as Type[Key] extends ValueType ? Key : never]: any
}
