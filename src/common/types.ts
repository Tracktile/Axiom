export type IsDotSeparated<T extends string> = T extends `${string}.${string}`
  ? true
  : false;

export type GetLeft<T extends string> = T extends `${infer Left}.${string}`
  ? Left
  : undefined;

export type FieldWithPossiblyUndefined<T, Key> =
  | GetFieldType<Exclude<T, undefined>, Key>
  | Extract<T, undefined>;

export type GetIndexedField<T, K> = K extends keyof T
  ? T[K]
  : K extends `${number}`
    ? "0" extends keyof T // tuples have string keys, return undefined if K is not in tuple
      ? undefined
      : number extends keyof T
        ? T[number]
        : undefined
    : undefined;

export type GetFieldType<T, P> = P extends `${infer Left}.${infer Right}`
  ? Left extends keyof T
    ? FieldWithPossiblyUndefined<T[Left], Right>
    : Left extends `${infer FieldKey}[${infer IndexKey}]`
      ? FieldKey extends keyof T
        ? FieldWithPossiblyUndefined<
            | GetIndexedField<Exclude<T[FieldKey], undefined>, IndexKey>
            | Extract<T[FieldKey], undefined>,
            Right
          >
        : undefined
      : undefined
  : P extends keyof T
    ? T[P]
    : P extends `${infer FieldKey}[${infer IndexKey}]`
      ? FieldKey extends keyof T
        ?
            | GetIndexedField<Exclude<T[FieldKey], undefined>, IndexKey>
            | Extract<T[FieldKey], undefined>
        : undefined
      : undefined;

export type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & (string | number)]: NonNullable<T[K]> extends object
        ? // eslint-disable-next-line
          NonNullable<T[K]> extends Function
          ? `${K}`
          : `${K}` | `${K}.${NestedKeyOf<NonNullable<T[K]>>}`
        : `${K}`;
    }[keyof T & (string | number)]
  : never;
