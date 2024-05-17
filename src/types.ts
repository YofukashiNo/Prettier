import { types } from "replugged";
import type util from "replugged/util";

export namespace Types {
  export import DefaultTypes = types;
  export type UtilTree = util.Tree;
  export type ReactTree = util.Tree & React.ReactElement;
  export interface CodeBlockOptions {
    content: string;
    inQuote: boolean;
    lang: string;
    type: string;
  }
  export type Jsonifiable =
    | null
    | undefined
    | boolean
    | number
    | string
    | Jsonifiable[]
    | { [key: string]: Jsonifiable };
  export type ValType<T> =
    | T
    | React.ChangeEvent<HTMLInputElement>
    | (Record<string, unknown> & { value?: T; checked?: T });

  export type NestedType<T, P> = P extends
    | `${infer Left}.${infer Right}`
    | `${infer Left}/${infer Right}`
    | `${infer Left}-${infer Right}`
    ? Left extends keyof T
      ? NestedType<T[Left], Right>
      : Left extends `${infer FieldKey}[${infer IndexKey}]`
        ? FieldKey extends keyof T
          ? NestedType<Exclude<T[FieldKey], undefined> extends infer U ? U : never, IndexKey>
          : undefined
        : undefined
    : P extends keyof T
      ? T[P]
      : P extends `${infer FieldKey}[${infer _IndexKey}]`
        ? FieldKey extends keyof T
          ? Exclude<T[FieldKey], undefined> extends infer U
            ? U
            : never
          : undefined
        : undefined;
  export interface Settings {
    autoFormat: boolean;
    formatOnSend: boolean;
    prettier: Record<string, boolean | string | number>;
  }
}
export default Types;
