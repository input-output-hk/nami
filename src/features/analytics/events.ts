export enum Events {
  PageView = '$pageview',
}

export type Property =
  | string
  | boolean
  | Record<string, any>
  | Array<Record<string, any>>;
export type Properties = Record<string, Property>;
