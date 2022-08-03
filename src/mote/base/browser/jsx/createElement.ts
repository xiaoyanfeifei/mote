import { CSSProperties } from './style';



type CSSKey = keyof CSSProperties;

export function setStyles(element: HTMLElement, styles?: CSSProperties) {
	if (!styles) {
		return;
	}
	const CSSKeys: CSSKey[] = Object.keys(styles) as CSSKey[];
	CSSKeys.map((key) => {
		const value = styles[key] as string;
		element.style[key as any] = value;
	});
}
