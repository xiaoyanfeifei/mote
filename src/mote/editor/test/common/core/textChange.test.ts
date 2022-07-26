import * as assert from 'assert';
import { textChange } from 'mote/editor/common/core/textChange';
import { DIFF_DELETE, DIFF_EQUAL, DIFF_INSERT } from 'mote/editor/common/diffMatchPatch';

suite('Editor Core - TextChange', () => {
	test('text change with space', () => {
		const diffs = textChange(buildSelection(2, 2), '# ', '# H');
		assert.equal(diffs.length, 2);
		assert.deepEqual(diffs[0], [DIFF_EQUAL, '# ']);
		assert.deepEqual(diffs[1], [DIFF_INSERT, 'H']);
	});

	test('text change for long string', () => {
		const diffs = textChange(buildSelection(9, 9), 'Hyi jia r', 'Hyi ji are');
		assert.equal(diffs.length, 3);
		assert.deepEqual(diffs[0], [DIFF_EQUAL, 'Hyi ji']);
		assert.deepEqual(diffs[1], [DIFF_DELETE, 'a r']);
		assert.deepEqual(diffs[2], [DIFF_INSERT, ' are']);
	});
});

function buildSelection(start: number, end: number) {
	return { startIndex: start, endIndex: end, lineNumber: -1 };
}
