import { isUndefined } from '@konfirm/guard';
import type { Descriptor } from '../Guard/Descriptor';

type Key = string | symbol;
type ObjectLiteral = { [key: Key]: unknown };
type PropertyDescriptorKey = keyof PropertyDescriptor;

const keys: { [key: string]: PropertyDescriptorKey } = {
	VALUE: 'value',
	GET: 'get',
	SET: 'set',
	CONFIGURABLE: 'configurable',
	ENUMERABLE: 'enumerable',
	WRITABLE: 'writable',
}

export class DescriptorMapper {
	static get(target: object, key: string | symbol): PropertyDescriptor {
		const descriptor = Object.getOwnPropertyDescriptor(target, key);

		return descriptor
			? descriptor
			: {
				value: undefined,
				writable: !Object.isFrozen(target),
				enumerable: true,
				configurable: Object.isExtensible(target),
			};
	}

	static only<T extends ObjectLiteral = ObjectLiteral>(target: T, ...keys: Array<Key>): T {
		return keys
			.filter((key) => key in target && !isUndefined(target[key]))
			.reduce((carry, key) => Object.assign(carry, { [key]: target[key] }), {} as T);
	}

	static omit<T extends ObjectLiteral = ObjectLiteral>(target: T, ...keys: Array<Key>): T {
		return this.only<T>(target, ...Object.keys(target).filter((key) => !keys.includes(key)));
	}

	static merge<T extends Descriptor = Descriptor>(...descriptors: Array<T | undefined>): T | undefined {
		return descriptors.reduce((carry, desc) => this.combine<T>(carry, desc), undefined);
	}

	private static combine<T extends Descriptor = Descriptor>(one: T | undefined, two: T | undefined): T | undefined {
		if (!(one && two)) {
			return two;
		}
		let input = one;

		if (keys.GET in two || keys.SET in two) {
			input = this.omit(input, keys.VALUE, keys.WRITABLE);
		}
		else if (keys.VALUE in two || keys.WRITABLE in two) {
			input = this.omit(input, keys.GET, keys.SET);
		}

		const output = Object.assign({} as T, input, two);

		// one can't exist without the other
		if (keys.SET in output && !(keys.GET in output)) {
			output[keys.GET] = () => { };
		}
		if (keys.WRITABLE in output && !(keys.VALUE in output)) {
			output[keys.VALUE] = undefined;
		}

		return output;
	}
}
