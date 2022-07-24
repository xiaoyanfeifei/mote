export interface ICommandDelegate {
	type(text: string): void;
	compositionType(text: string, replacePrevCharCnt: number, replaceNextCharCnt: number, positionDelta: number): void;
}

export class ViewController {
	constructor(
		private readonly commandDelegate: ICommandDelegate,
	) {

	}

	public type(text: string): void {
		this.commandDelegate.type(text);
	}

	public compositionType(text: string, replacePrevCharCnt: number, replaceNextCharCnt: number, positionDelta: number): void {
		this.commandDelegate.compositionType(text, replacePrevCharCnt, replaceNextCharCnt, positionDelta);
	}
}
