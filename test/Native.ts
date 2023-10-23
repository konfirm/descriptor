import test from 'tape';
import { each } from 'template-literal-each';
import { DescriptorMapper } from '../source/Domain/Mapper/DescriptorMapper';

function stringify(value: object): string {
    const pairs = Object.keys(value)
        .reduce((carry, key) => carry.concat(`${key}: ` + (typeof value[key] === 'function' ? 'Function' : JSON.stringify(value[key]))), [] as Array<string>);

    return `{ ${pairs.join(', ')} }`;
}

class Test {
    public existing = 'value';
}
class GetterTest {
    public existing = 'value';
}

test('Native - Object.getOwnPropertyDescriptor versus DescriptorMapper.get', (t) => {
    const targets = [
        { description: 'shorthand', factory: () => ({ existing: 'value' }) },
        { description: 'new object', factory: () => new Object({ existing: 'value' }) },
        { description: 'class instance', factory: () => new Test },
        { description: 'static class', factory: () => class StaticTest { public static existing = 'value' } },
        { description: 'class instance with getter', factory: () => new GetterTest },
        { description: 'static class with getter', factory: () => class StaticGetterTest { static get existing(): string { return 'value' } } },
    ];
    const flags = [
        { seal: false, freeze: false, preventExtensions: false },
        { seal: true, freeze: false, preventExtensions: false },
        { seal: false, freeze: true, preventExtensions: false },
        { seal: false, freeze: false, preventExtensions: true },
        { seal: true, freeze: true, preventExtensions: false },
        { seal: false, freeze: true, preventExtensions: true },
        { seal: true, freeze: false, preventExtensions: true },
        { seal: true, freeze: true, preventExtensions: true },
    ];

    targets.forEach(({ description, factory }) => {
        flags.forEach((invoke) => {
            // arrange
            const input = factory();
            const flags = Object.keys(invoke)
                .filter((key) => invoke[key])
                .map((invoke) => {
                    Object[invoke](input);

                    return invoke
                })
                .join(', ');

            t.deepEqual(Object.getOwnPropertyDescriptor(input, 'existing'), DescriptorMapper.get(input, 'existing'), description + ' existing property' + (flags ? ` (${flags})` : ''));

            try {
                (<any>input).assign = 'assigned';
                t.deepEqual(Object.getOwnPropertyDescriptor(input, 'assign'), DescriptorMapper.get(input, 'assign'), description + ' assigned property' + (flags ? ` (${flags})` : ''));
            }
            catch (_error) { }

            try {
                Object.defineProperty(input, 'define', {});
                t.deepEqual(Object.getOwnPropertyDescriptor(input, 'define'), DescriptorMapper.get(input, 'define'), description + ' defined property' + (flags ? ` (${flags})` : ''));
            }
            catch (_error) { }
        });
    })

    t.end();
});

test('Native - Object.getOwnPropertyDescriptor versus DescriptorMapper.get after defineProperty', (t) => {
    let value = 0;

    each`
		writable | enumerable | configurable 
		---------|------------|--------------
		         |            | 
		${true}  |            | 
		${false} |            | 
		         | ${true}    | 
		         | ${false}   | 
		         |            | ${true}
		         |            | ${false}
        ${true}  | ${true}    |
        ${false} | ${true}    |
        ${true}  | ${false}   |
        ${false} | ${false}   |
        ${true}  |            | ${true}
        ${false} |            | ${true}
        ${true}  |            | ${false}
        ${false} |            | ${false}
                 | ${true}    | ${true}
                 | ${false}   | ${true}
                 | ${true}    | ${false}
                 | ${false}   | ${false}
        ${true}  | ${true}    | ${true}
        ${false} | ${true}    | ${true}
        ${true}  | ${false}   | ${true}
        ${true}  | ${true}    | ${false}
        ${false} | ${false}   | ${true}
        ${false} | ${true}    | ${false}
        ${true}  | ${false}   | ${false}
        ${false} | ${false}   | ${false}
	`(({ writable, enumerable, configurable }: any) => {
        [
            { value: ++value, writable },
            { get: () => value, set: undefined },
            { get: () => value, set: () => { } },
            { get: undefined, set: () => { } },
        ].forEach((append) => {
            const target = {};
            const define = { ...append, enumerable, configurable };
            const expect = { ...append, ...('writable' in append ? { writable: writable || false } : {}), enumerable: enumerable || false, configurable: configurable || false };

            Object.defineProperty(target, 'new', define);

            const descriptor = DescriptorMapper.get(target, 'new');
            t.deepEqual(descriptor, expect, `defined ${stringify(define)} returns ${stringify(expect)}`);
            t.deepEqual(descriptor, Object.getOwnPropertyDescriptor(target, 'new'), `Object.getOwnPropertyDescriptor returns ${stringify(expect)}`);
        });
    });

    t.end();
});
