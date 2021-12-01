import { isUndefined } from '@konfirm/guard';
import type { Descriptor } from '../Guard/Descriptor';

type Key = string | symbol;
type ObjectLiteral = { [key: Key]: unknown };

export class DescriptorMapper {
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

		if ('get' in two || 'set' in two) {
			input = this.omit(input, 'value', 'writable');
		}
		else if ('value' in two || 'writable' in two) {
			input = this.omit(input, 'get', 'set');
		}

		const output = Object.assign({} as T, input, two);

		// one can't exist without the other
		if ('set' in output && !('get' in output)) {
			output.get = () => { };
		}
		if ('writable' in output && !('value' in output)) {
			output.value = undefined;
		}

		return output;
	}
}
