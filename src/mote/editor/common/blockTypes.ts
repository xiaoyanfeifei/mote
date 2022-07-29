

const blockTypes = {
	text: "text",
	quote: 'quote',
	todo: 'todo',
	code: "code",
	image: "image",
	header: "header",
	page: "page",
	subHeader: "sub_header",
	secondLevelHeader: "second_level_header",
	thridLevelHeader: "thrid_level_header",
	fourthLevelHeader: "fourth_level_header",
	fifthLevelHeaderBlock: "fifth_level_header",
	sixthLevelHeaderBlock: "sixth_level_header"
};

export const textBasedTypes = new Set([
	blockTypes.header,
	blockTypes.quote,
	blockTypes.todo,
	blockTypes.secondLevelHeader,
	blockTypes.thridLevelHeader,
	blockTypes.fourthLevelHeader,
	blockTypes.fifthLevelHeaderBlock,
	blockTypes.sixthLevelHeaderBlock,
]);

export const pureTextTypes = new Set([
	blockTypes.text,
	blockTypes.header,
	blockTypes.secondLevelHeader,
	blockTypes.thridLevelHeader,
	blockTypes.fourthLevelHeader,
	blockTypes.fifthLevelHeaderBlock,
	blockTypes.sixthLevelHeaderBlock,
]);

export const mediaTypes = new Set([
	blockTypes.image
]);

export const contentTypes = new Set([
	...mediaTypes,
	blockTypes.code
])

export default blockTypes;
