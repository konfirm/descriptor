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

test('Domain/Mapper/DescriptorMapper - get', (t) => {
	function clone(struct: object, ...invoke: Array<'freeze' | 'seal' | 'preventExtensions'>): typeof struct {
		const cloned = { ...struct };

		invoke.forEach((method) => (<any>Object[method as keyof Object])(cloned));

		return cloned;
	}

	const sym = Symbol();
	const standard = { foo: 1, bar: 2, baz: 3, [sym]: 4 };
	const standard_f = clone(standard, 'freeze');
	const standard_s = clone(standard, 'seal');
	const standard_p = clone(standard, 'preventExtensions');
	const standard_fs = clone(standard, 'freeze', 'seal');
	const standard_fp = clone(standard, 'freeze', 'preventExtensions');
	const standard_sp = clone(standard, 'seal', 'preventExtensions');
	const standard_fsp = clone(standard, 'freeze', 'seal', 'preventExtensions');

	each`
		target          | state                                 | key    | value | writable | configurable
		----------------|---------------------------------------|--------|-------|----------|--------------
		${standard}     |                                       | foo    | ${1}  | ${true}  | ${true}
		${standard}     |                                       | bar    | ${2}  | ${true}  | ${true}
		${standard}     |                                       | baz    | ${3}  | ${true}  | ${true}
		${standard}     |                                       | ${sym} | ${4}  | ${true}  | ${true}
		${standard}     |                                       | new    |       | ${true}  | ${true}
		${standard_f}   | frozen                                | foo    | ${1}  | ${false} | ${false}
		${standard_f}   | frozen                                | bar    | ${2}  | ${false} | ${false}
		${standard_f}   | frozen                                | baz    | ${3}  | ${false} | ${false}
		${standard_f}   | frozen                                | ${sym} | ${4}  | ${false} | ${false}
		${standard_f}   | frozen                                | new    |       | ${false} | ${false}
		${standard_s}   | sealed                                | foo    | ${1}  | ${true}  | ${false}
		${standard_s}   | sealed                                | bar    | ${2}  | ${true}  | ${false}
		${standard_s}   | sealed                                | baz    | ${3}  | ${true}  | ${false}
		${standard_s}   | sealed                                | ${sym} | ${4}  | ${true}  | ${false}
		${standard_s}   | sealed                                | new    |       | ${true}  | ${false}
		${standard_p}   | prevent extensions                    | foo    | ${1}  | ${true}  | ${true}
		${standard_p}   | prevent extensions                    | bar    | ${2}  | ${true}  | ${true}
		${standard_p}   | prevent extensions                    | baz    | ${3}  | ${true}  | ${true}
		${standard_p}   | prevent extensions                    | ${sym} | ${4}  | ${true}  | ${true}
		${standard_p}   | prevent extensions                    | new    |       | ${true}  | ${false}
		${standard_fs}  | frozen and sealed                     | foo    | ${1}  | ${false} | ${false}
		${standard_fs}  | frozen and sealed                     | bar    | ${2}  | ${false} | ${false}
		${standard_fs}  | frozen and sealed                     | baz    | ${3}  | ${false} | ${false}
		${standard_fs}  | frozen and sealed                     | ${sym} | ${4}  | ${false} | ${false}
		${standard_fs}  | frozen and sealed                     | new    |       | ${false} | ${false}
		${standard_fp}  | frozen and prevent extensions         | foo    | ${1}  | ${false} | ${false}
		${standard_fp}  | frozen and prevent extensions         | bar    | ${2}  | ${false} | ${false}
		${standard_fp}  | frozen and prevent extensions         | baz    | ${3}  | ${false} | ${false}
		${standard_fp}  | frozen and prevent extensions         | ${sym} | ${4}  | ${false} | ${false}
		${standard_fp}  | frozen and prevent extensions         | new    |       | ${false} | ${false}
		${standard_sp}  | sealed and prevent extensions         | foo    | ${1}  | ${true}  | ${false}
		${standard_sp}  | sealed and prevent extensions         | bar    | ${2}  | ${true}  | ${false}
		${standard_sp}  | sealed and prevent extensions         | baz    | ${3}  | ${true}  | ${false}
		${standard_sp}  | sealed and prevent extensions         | ${sym} | ${4}  | ${true}  | ${false}
		${standard_sp}  | sealed and prevent extensions         | new    |       | ${true}  | ${false}
		${standard_fsp} | frozen, sealed and prevent extensions | foo    | ${1}  | ${false} | ${false}
		${standard_fsp} | frozen, sealed and prevent extensions | bar    | ${2}  | ${false} | ${false}
		${standard_fsp} | frozen, sealed and prevent extensions | baz    | ${3}  | ${false} | ${false}
		${standard_fsp} | frozen, sealed and prevent extensions | ${sym} | ${4}  | ${false} | ${false}
		${standard_fsp} | frozen, sealed and prevent extensions | new    |       | ${false} | ${false}
	`(({ target, state, key, value, writable, configurable }: any) => {
		const flags = { value, writable, enumerable: true, configurable };

		t.deepEqual(DescriptorMapper.get(target, key), flags, `${state} ${JSON.stringify(target)} has ${key.toString()} descriptor ${JSON.stringify(flags)}`);
	});

	t.end();
});


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
	`(({ input, current }: any) => {
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
