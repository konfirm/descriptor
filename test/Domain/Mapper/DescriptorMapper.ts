import test from 'tape';
import { each } from 'template-literal-each';
import { stringify } from '@konfirm/stringify';
import * as Export from '../../../source/Domain/Mapper/DescriptorMapper';

test('Domain/Mapper/DescriptorMapper - exports', (t) => {
	const expect = ['DescriptorMapper'];
	const keys = Object.keys(Export);

	t.deepEqual(keys, expect, `exports ${expect.join(', ')}`);
	expect.every((key) => {
		t.equal(typeof Export[key], 'function', `${key} is a function`);
	});

	t.end();
});

const { DescriptorMapper } = Export;

test('Domain/Mapper/DescriptorMapper - only', (t) => {
	const sample = { foo: 1, bar: 2, baz: 3 };
	const methods = { arrow: () => 'arrow', func() { return `func ${sample.bar}` } };

	t.deepEqual(DescriptorMapper.only(sample, 'foo', 'baz'), { foo: 1, baz: 3 }, 'leaves only foo and baz');

	const arrow = DescriptorMapper.only(methods, 'arrow');
	t.deepEqual(arrow, { arrow: methods.arrow }, 'leaves only the arrow method');
	t.equal(stringify(arrow), '{arrow:ArrowFunction arrow}', 'maintained the arrow method as arrow function');
	t.equal(arrow.arrow(), 'arrow', 'the arrow method still works');

	const func = DescriptorMapper.only(methods, 'func');
	t.deepEqual(func, { func: methods.func }, 'leaves only the func method');
	t.equal(stringify(func), '{func:ShorthandFunction func}', 'maintained the func method as function declaration');
	t.equal(func.func(), 'func 2', 'the func method still works');

	t.end();
});

test('Domain/Mapper/DescriptorMapper - omit', (t) => {
	const sample = { foo: 1, bar: 2, baz: 3 };
	const methods = { arrow: () => 'arrow', func() { return `func ${sample.bar}` } };

	t.deepEqual(DescriptorMapper.omit(sample, 'baz'), { foo: 1, bar: 2 }, 'leaves only foo and bar');

	const arrow = DescriptorMapper.omit(methods, 'arrow');
	t.deepEqual(arrow, { func: methods.func }, 'leaves only the func method');
	t.equal(stringify(arrow), '{func:ShorthandFunction func}', 'maintained the func method as function declaration');
	t.equal(arrow.func(), 'func 2', 'the func method still works');

	const func = DescriptorMapper.omit(methods, 'func');
	t.deepEqual(func, { arrow: methods.arrow }, 'leaves only the arrow method');
	t.equal(stringify(func), '{arrow:ArrowFunction arrow}', 'maintained the arrow method as arrow function');
	t.equal(func.arrow(), 'arrow', 'the arrow method still works');

	t.end();
});

test('Domain/Mapper/DescriptorMapper - merge', (t) => {
	let merged: any = {};
	let change: number = 0
	const getter = () => change;
	const setter = (value: number) => { change = value };

	each`
		input                                         | current
		----------------------------------------------|---------
		${{ enumerable: true }}                       | ${{ enumerable: true }}
		${{ value: 'value' }}                         | ${{ enumerable: true, value: 'value' }}
		${{ writable: false }}                        | ${{ enumerable: true, value: 'value', writable: false }}
		${{ enumerable: false, configurable: false }} | ${{ enumerable: false, value: 'value', writable: false, configurable: false }}
		${{ configurable: true }}                     | ${{ enumerable: false, value: 'value', writable: false, configurable: true }}
		${{ value: 'change' }}                        | ${{ enumerable: false, value: 'change', writable: false, configurable: true }}
		${{ get: getter }}                            | ${{ enumerable: false, configurable: true, get: getter }}
		${{ set: setter }}                            | ${{ enumerable: false, configurable: true, get: getter, set: setter }}
		${{ writable: false }}                        | ${{ enumerable: false, configurable: true, writable: false, value: undefined }}
		${{ get: getter, set: setter }}               | ${{ enumerable: false, configurable: true, get: getter, set: setter }}
		${{ enumerable: true }}                       | ${{ enumerable: true, configurable: true, get: getter, set: setter }}
		${{ value: 'modify' }}                        | ${{ enumerable: true, configurable: true, value: 'modify' }}
	`(({ input, current }) => {
		merged = DescriptorMapper.merge(merged, input);

		t.deepEqual(merged, current, `Adding ${stringify(input)} should result in ${stringify(current)}`);
	});

	// deepEqual cannot work for this last check
	merged = DescriptorMapper.merge(merged, { set: setter });
	t.notOk('value' in merged, 'value is not present');
	t.notOk('writable' in merged, 'writable is not present');
	t.equal(merged.enumerable, true, 'enumerable is true');
	t.equal(merged.configurable, true, 'configurable is true');
	t.equal(merged.set, setter, 'set the setter');
	t.equal(typeof merged.get, 'function', 'get is a function');
	t.equal(merged.get(), undefined, 'get returns undefined');

	t.end();
});
