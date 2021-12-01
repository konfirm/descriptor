import { isBoolean, isStrictStructure } from "@konfirm/guard";

const structure = {
	configurable: isBoolean,
	enumerable: isBoolean,
	value: () => true,
	writable: isBoolean,
};
const optional = Object.keys(structure).filter((key) => key !== 'value');

export type ValueAccessorDescriptor = Pick<PropertyDescriptor, 'configurable' | 'enumerable' | 'value' | 'writable'>;
export const isValueAccessorDescriptor = isStrictStructure<ValueAccessorDescriptor>(structure, optional);
