export const Fragment = "<></>";

type MoteText = string | number;
type MoteChild = MoteElement | MoteText;

interface MoteNodeArray extends Array<MoteNode> {}
type MoteFragment = {} | MoteNodeArray;
export type MoteNode = MoteChild | MoteFragment | boolean | null | undefined;

type Key = string | number;
interface MoteElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
}

type JSXElementConstructor<P> = ((props: P) => MoteElement<any, any> | null)

type PropsWithChildren<P> = P & { children?: MoteNode | undefined };

export interface FunctionComponent<P = {}> {
    (props: PropsWithChildren<P>): MoteElement<any, any> | null;
    defaultProps?: Partial<P> | undefined;
    displayName?: string | undefined;
}

interface FunctionComponentElement<P> extends MoteElement<P, FunctionComponent<P>> {}

type FunctionComponentFactory<P> = (props?: Attributes & P, ...children: MoteNode[]) => FunctionComponentElement<P>;


/**
 * @internal You shouldn't need to use this type since you never see these attributes
 * inside your component or have to validate them.
 */
export interface Attributes {
    key?: Key | null | undefined;
}