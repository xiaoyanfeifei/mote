import * as assert from 'assert';
import 'mote/base/browser/prism/component/prismCLike';
import 'mote/base/browser/prism/component/prismJavaScript';
import { Prismhelper } from 'mote/base/test/browser/prism/prismHelper';

suite('Base - Prism Javascript', () => {
	test('javascript tokenize', () => {
		const code = 'var';
		const result = Prismhelper.simplify(Prismhelper.tokenize(code, 'javascript'));

		assert.deepEqual(result, [['keyword', 'var']]);
	});

	test('javascript new line', () => {
		const code = '\nvar';
		const result = Prismhelper.simplify(Prismhelper.tokenize(code, 'javascript'));

		assert.deepEqual(result, ['\n', ['keyword', 'var']]);
	});
});
