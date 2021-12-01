import { isBoolean, isFunction, isStrictStructure } from "@konfirm/guard";

const structure = {
	configurable: isBoolean,
	enumerable: isBoolean,
	get: isFunction,
	set: isFunction,
};
const optional = Object.keys(structure).filter((key) => key !== 'get');

export type GetterAccessorDescriptor = Pick<PropertyDescriptor, 'configurable' | 'enumerable' | 'get' | 'set'>;
export const isGetterAccessorDescriptor = isStrictStructure<GetterAccessorDescriptor>(structure, ...optional);
