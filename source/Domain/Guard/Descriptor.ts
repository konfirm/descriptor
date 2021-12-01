import { any } from "@konfirm/guard";
import { DataDescriptor, isDataDescriptor } from "./DataDescriptor";
import { GetterAccessorDescriptor, isGetterAccessorDescriptor } from "./GetterAccessorDescriptor";
import { ValueAccessorDescriptor, isValueAccessorDescriptor } from "./ValueAccessorDescriptor";

export type Descriptor
	= DataDescriptor
	| ValueAccessorDescriptor
	| GetterAccessorDescriptor;

export const isDescriptor = any<Descriptor>(
	isDataDescriptor,
	isValueAccessorDescriptor,
	isGetterAccessorDescriptor
);
