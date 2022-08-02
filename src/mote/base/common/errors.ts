export class CaffeineError extends Error {
	readonly isExpected = true;

	constructor(
		message: string,
		public readonly code: number,
		options?: ErrorOptions
	) {
		super(message, options);
	}
}
