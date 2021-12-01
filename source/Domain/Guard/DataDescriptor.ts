import { isBoolean, isStrictStructure } from "@konfirm/guard";

const structure = {
	enumerable: isBoolean,
	configurable: isBoolean,
};

export type DataDescriptor = Pick<PropertyDescriptor, 'configurable' | 'enumerable'>;
export const isDataDescriptor = isStrictStructure(structure, Object.keys(structure));
