import test from 'tape';
import each from 'template-literal-each';
import { stringify } from '@konfirm/stringify';
import { DescriptorMapper } from '../../../source/Domain/Mapper/DescriptorMapper';
import * as Export from '../../../source/Domain/Guard/DataDescriptor';

test('Domain/Guard/DataDescriptor - exports', (t) => {
	const expect = ['isDataDescriptor'];
	const keys = Object.keys(Export);

	t.deepEqual(keys, expect, `exports ${expect.join(', ')}`);
	expect.every((key) => {
		t.equal(typeof Export[key], 'function', `${key} is a function`);
	});

	t.end();
});

const { isDataDescriptor } = Export;

test('Domain/Guard/DataDescriptor - isDataDescriptor', (t) => {
	each`
		configurable | enumerable   | get           | set          | value        | writable     | valid
		-------------|--------------|---------------|--------------|--------------|--------------|-------
		${undefined} | ${undefined} | ${undefined}  | ${undefined} | ${undefined} | ${undefined} | yes
		${true}      | ${undefined} | ${undefined}  | ${undefined} | ${undefined} | ${undefined} | yes
		${false}     | ${undefined} | ${undefined}  | ${undefined} | ${undefined} | ${undefined} | yes
		${undefined} | ${true}      | ${undefined}  | ${undefined} | ${undefined} | ${undefined} | yes
		${undefined} | ${false}     | ${undefined}  | ${undefined} | ${undefined} | ${undefined} | yes
		${true}      | ${true}      | ${undefined}  | ${undefined} | ${undefined} | ${undefined} | yes
		${false}     | ${false}     | ${undefined}  | ${undefined} | ${undefined} | ${undefined} | yes
		${1}         | ${undefined} | ${undefined}  | ${undefined} | ${undefined} | ${undefined} | no
		${undefined} | ${1}         | ${undefined}  | ${undefined} | ${undefined} | ${undefined} | no
		${1}         | ${1}         | ${undefined}  | ${undefined} | ${undefined} | ${undefined} | no
		${undefined} | ${undefined} | ${() => true} | ${undefined} | ${undefined} | ${undefined} | no
		${undefined} | ${undefined} | ${undefined}  | ${() => { }} | ${undefined} | ${undefined} | no
		${undefined} | ${undefined} | ${() => true} | ${() => { }} | ${undefined} | ${undefined} | no
		${undefined} | ${undefined} | ${undefined}  | ${undefined} | ${1234}      | ${undefined} | no
		${undefined} | ${undefined} | ${undefined}  | ${undefined} | ${1234}      | ${true}      | no
		${undefined} | ${undefined} | ${undefined}  | ${undefined} | ${1234}      | ${false}     | no
		${undefined} | ${undefined} | ${undefined}  | ${undefined} | ${undefined} | ${true}      | no
		${undefined} | ${undefined} | ${undefined}  | ${undefined} | ${undefined} | ${false}     | no
		${true}      | ${undefined} | ${() => true} | ${undefined} | ${undefined} | ${undefined} | no
		${true}      | ${undefined} | ${undefined}  | ${() => { }} | ${undefined} | ${undefined} | no
		${true}      | ${undefined} | ${() => true} | ${() => { }} | ${undefined} | ${undefined} | no
		${true}      | ${undefined} | ${undefined}  | ${undefined} | ${1234}      | ${undefined} | no
		${true}      | ${undefined} | ${undefined}  | ${undefined} | ${1234}      | ${true}      | no
		${true}      | ${undefined} | ${undefined}  | ${undefined} | ${1234}      | ${false}     | no
		${true}      | ${undefined} | ${undefined}  | ${undefined} | ${undefined} | ${true}      | no
		${true}      | ${undefined} | ${undefined}  | ${undefined} | ${undefined} | ${false}     | no
		${true}      | ${undefined} | ${() => true} | ${() => { }} | ${1234}      | ${true}      | no
		${undefined} | ${true}      | ${() => true} | ${undefined} | ${undefined} | ${undefined} | no
		${undefined} | ${true}      | ${undefined}  | ${() => { }} | ${undefined} | ${undefined} | no
		${undefined} | ${true}      | ${() => true} | ${() => { }} | ${undefined} | ${undefined} | no
		${undefined} | ${true}      | ${undefined}  | ${undefined} | ${1234}      | ${undefined} | no
		${undefined} | ${true}      | ${undefined}  | ${undefined} | ${1234}      | ${true}      | no
		${undefined} | ${true}      | ${undefined}  | ${undefined} | ${1234}      | ${false}     | no
		${undefined} | ${true}      | ${undefined}  | ${undefined} | ${undefined} | ${true}      | no
		${undefined} | ${true}      | ${undefined}  | ${undefined} | ${undefined} | ${false}     | no
		${undefined} | ${true}      | ${() => true} | ${() => { }} | ${1234}      | ${true}      | no
		${true}      | ${true}      | ${() => true} | ${() => { }} | ${1234}      | ${true}      | no
	`(({ valid, ...rest }: any) => {
		const defined = DescriptorMapper.omit(rest, ...Object.keys(rest).filter((key) => typeof rest[key] === 'undefined'));
		const match = valid === 'yes';
		const message = match ? 'valid' : 'not valid';

		t.equal(isDataDescriptor(defined), match, `${stringify(defined)} is ${message}`);
	});

	t.end();
});
