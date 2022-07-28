import * as assert from 'assert';
import { DiffMatchPatch } from 'mote/editor/common/diffMatchPatch';

suite('Editor Common - DiffMatchPatch', () => {
	const diffMatchPatch = new DiffMatchPatch();
	test('testDiffCommonPrefix', () => {
		// Null case.
		assert.equal(0, diffMatchPatch.diffCommonPrefix('abc', 'xyz'));

		// Non-null case.
		assert.equal(4, diffMatchPatch.diffCommonPrefix('1234abcdef', '1234xyz'));

		// Whole case.
		assert.equal(4, diffMatchPatch.diffCommonPrefix('1234', '1234xyz'));
	});

	test('testDiffCommonSuffix', () => {
		// Null case.
		assert.equal(0, diffMatchPatch.diffCommonSuffix('abc', 'xyz'));

		// Non-null case.
		assert.equal(4, diffMatchPatch.diffCommonSuffix('abcdef1234', 'xyz1234'));

		// Whole case.
		assert.equal(4, diffMatchPatch.diffCommonSuffix('1234', 'xyz1234'));
	});

	test('testDiffCommonOverlap', () => {
		// Null case.
		assert.equal(0, diffMatchPatch.diffCommonOverlap('', 'abcd'));

		// Whole case.
		assert.equal(3, diffMatchPatch.diffCommonOverlap('abc', 'abcd'));

		// No overlap.
		assert.equal(0, diffMatchPatch.diffCommonOverlap('123456', 'abcd'));

		// Overlap.
		assert.equal(3, diffMatchPatch.diffCommonOverlap('123456xxx', 'xxxabcd'));

		// Unicode.
		// Some overly clever languages (C#) may treat ligatures as equal to their
		// component letters.  E.g. U+FB01 == 'fi'
		assert.equal(0, diffMatchPatch.diffCommonOverlap('fi', '\ufb01i'));

	});

	test('testDiffHalfMatch', () => {
		DiffMatchPatch.Diff_Timeout = 1;

		// No match.
		assert.equal(null, diffMatchPatch.diffHalfMatch('1234567890', 'abcdef'));

		// No match.
		assert.equal(null, diffMatchPatch.diffHalfMatch('12345', '23'));

		// Single Match.
		assert.deepEqual(['12', '90', 'a', 'z', '345678'], diffMatchPatch.diffHalfMatch('1234567890', 'a345678z'));

		assert.deepEqual(['a', 'z', '12', '90', '345678'], diffMatchPatch.diffHalfMatch('a345678z', '1234567890'));

		assert.deepEqual(['abc', 'z', '1234', '0', '56789'], diffMatchPatch.diffHalfMatch('abc56789z', '1234567890'));

		assert.deepEqual(['a', 'xyz', '1', '7890', '23456'], diffMatchPatch.diffHalfMatch('a23456xyz', '1234567890'));

		// Multiple Matches.
		assert.deepEqual(['12123', '123121', 'a', 'z', '1234123451234'], diffMatchPatch.diffHalfMatch('121231234123451234123121', 'a1234123451234z'));


		// Non-optimal halfmatch.
		//Optimal diff would be -q+x=H-i+e=lloHe+Hu=llo-Hew+y not -qHillo+x=HelloHe-w+Hulloy
		assert.deepEqual(['qHillo', 'w', 'x', 'Hulloy', 'HelloHe'], diffMatchPatch.diffHalfMatch('qHilloHelloHew', 'xHelloHeHulloy'));

		// Optimal no halfmatch.
		DiffMatchPatch.Diff_Timeout = 0;
		assert.equal(null, diffMatchPatch.diffHalfMatch('qHilloHelloHew', 'xHelloHeHulloy'));
	});

	test('testDiffLinesToChars', () => {

	});
});
