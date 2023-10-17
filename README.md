![tests](https://github.com/konfirm/descriptor/actions/workflows/tests.yml/badge.svg)
![release](https://github.com/konfirm/descriptor/actions/workflows/release.yml/badge.svg)

# Descriptor
Working with `PropertyDescriptor` objects requires some inner knowledge on which settings go together and which are mutually exclusive. This package deals with those mechanics and provides more robust type hinting for TypeScript users.


## Installation

```
npm install --save @konfirm/descriptor
```

Or use your favorite package manager to install `@konfirm/descriptor`


## API

### Exports

| name                         | description                                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `Descriptor`                 | _TypeScript_ type alias for one of: `DataDescriptor`, `GetterAccessorDescriptor` or `ValueAccessorDescriptor`     |
| `isDescriptor`               | type guard which validates the input to be a `Descriptor` type                                                    |
| `DataDescriptor`             | _TypeScript_ type alias describing `{enumerable?:boolean, configurable?: boolean}`                                |
| `isDataDescriptor`           | type guard which validates the input to be a `DataDescriptor` type                                                |
| `GetterAccessorDescriptor`   | _TypeScript_ type alias describing `{enumerable?:boolean, configurable?: boolean, get: Function, set?: Function}` |
| `isGetterAccessorDescriptor` | type guard which validates the input to be a `GetterAccessorDescriptor` type                                      |
| `ValueAccessorDescriptor`    | _TypeScript_ type alias describing `{enumerable?:boolean, configurable?: boolean, value: any, writable: boolean}` |
| `isValueAccessorDescriptor`  | type guard which validates the input to be a `ValueAccessorDescriptor` type                                       |
| `DescriptorMapper`           | A convenience descriptor mapper                                                                                   |

```js
//const { isDescriptor } = require('@konfirm/descriptor');
import { isDescriptor } from '@konfirm/descriptor';

console.log(isDescriptor({ value: 'hello' })); // true
console.log(isDescriptor({ nope: 'hello' }));  // false
```

### `DescriptorMapper`
Intended to do the heavy lifting for merging `Descriptor` object, maintaining a valid combination of settings at all times

```js
//const { DescriptorMapper } = require('@konfirm/descriptor');
import { DescriptorMapper } from '@konfirm/descriptor';

const one = { value: 'a value', writable: false };
const two = { get: () => 'getter', enumerable: true };

const oneAndTwo = DescriptorMapper.merge(one, two); // { get, enumerable };
const twoAndOne = DescroptorMapper.merge(two, one); // { value, writable, enumerable }
```

#### Methods

| name    | parameters                  | description                                                    |
| ------- | --------------------------- | -------------------------------------------------------------- |
| `get`   | `object, string|symbol key` | Obtain the descriptor for given key                            |
| `merge` | `...Descriptor`             | Merges any number of desciptors into one                       |
| `omit`  | `Descriptor, ...string key` | Create a new object without one or more keys from a descriptor |
| `only`  | `Descriptor, ...string key` | Create a new object with only the specified keys               |


## License
MIT License Copyright (c) 2021-2023 Rogier Spieker (Konfirm)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
