export enum NodeEnvironment {
  Prod = "production",
  Dev = "development",
}

export const IS_PROD = process.env.NODE_ENV === NodeEnvironment.Prod;

export const ONE_HOUR_AS_SECONDS = 3600;
export const FIVE_MIN_AS_SECONDS = 300;
export const ONE_HOUR_AS_MS = 3_600_000;

export type PlainObject = Record<string | number | symbol, any>;
export type DeepPartial<Type extends PlainObject> = {
  [Property in keyof Type]?: Type[Property] extends PlainObject
    ? DeepPartial<Type[Property]>
    : Type[Property];
};
