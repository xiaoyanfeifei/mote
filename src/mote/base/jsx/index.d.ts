import * as CSS from 'csstype';

type Key = string | number;

type Booleanish = boolean | 'true' | 'false';

export interface CSSProperties extends CSS.Properties<string | number> {
    /**
     * The index signature was removed to enable closed typing for style
     * using CSSType. You're able to use type assertion or module augmentation
     * to add properties or an index signature of your own.
     *
     * For examples and more information, visit:
     * https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
     */
}

interface HTMLAttributes<T> {
    // Standard HTML Attributes
    accessKey?: string | undefined;
    className?: string | undefined;
    contentEditable?: Booleanish | "inherit" | undefined;
    contextMenu?: string | undefined;
    dir?: string | undefined;
    draggable?: Booleanish | undefined;
    hidden?: boolean | undefined;
    id?: string | undefined;
    lang?: string | undefined;
    placeholder?: string | undefined;
    slot?: string | undefined;
    spellCheck?: Booleanish | undefined;
    style?: CSSProperties | undefined;
    tabIndex?: number | undefined;
    title?: string | undefined;
    translate?: 'yes' | 'no' | undefined;
}