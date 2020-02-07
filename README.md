[![npm package](https://badge.fury.io/js/ts-transform-asset.svg)](https://www.npmjs.com/package/ts-transform-asset)
[![License](https://img.shields.io/github/license/slune-org/ts-transform-asset.svg)](https://github.com/slune-org/ts-transform-asset/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/slune-org/ts-transform-asset.svg?branch=master)](https://travis-ci.org/slune-org/ts-transform-asset)
[![Coverage Status](https://coveralls.io/repos/github/slune-org/ts-transform-asset/badge.svg?branch=master)](https://coveralls.io/github/slune-org/ts-transform-asset?branch=master)
[![Issues](https://img.shields.io/github/issues/slune-org/ts-transform-asset.svg)](https://github.com/slune-org/ts-transform-asset/issues)

# ts-transform-asset - Typescript transformer for asset imports

This transformer will simply convert imports or reexports like:

```typescript
import foo from './images/foo.gif'
import * as bar from '../images/bar.png'
export { default } from './foobar.svg'
export { default as foobar } from './foobar.ico'
```

to:

```typescript
const foo = 'assets/foo.gif'
const bar = 'assets/bar.png'
const foobar_svg_1 = 'assets/foobar.svg'
export default foobar_svg_1
export const foobar = 'assets/foobar.ico'
```

# Language/langue

Because Slune is French firm, you will find all documents and messages in French. Other translations are welcome.

Anyway, because English is the language of programming, the code, including variable names and comments, are in English.

:fr: Une version française de ce document se trouve [ici](doc/fr/README.md).

# Installation

Installation is done using `npm install` command:

```bash
$ npm install --save-dev ts-transform-asset
```

If you prefer using `yarn`:

```bash
$ yarn add --dev ts-transform-asset
```

# Why would I need that?

You have a project using `Webpack` with the `file-loader` plugin. When this plugin finds an `import foo from "./images/foo.gif"`, it copies `foo.gif` to an assets directory and change the usage of `foo` using the public path to the file. Great.

Then, you have another project, which contains the web server. This server, which depends on the previous project, will take the bundle and all assets to serve them to the clients. But you also want to do some server side rendering (SSR). And for this, you cannot use the bundle created by `Webpack` because it does not have an appropriate entry point for the server (e.g. you need to use a `StaticRouter` instead of a `BrowserRouter`). Or maybe you prefer using the transpiled `javascript` and definition files instead of the minified and untyped bundle.

Unfortunately, this is not working, because your server do not know what to do with your assets files.

Using this transformer to transpile the web pages (not for `Webpack`!), you will convert your imports into constants with the URL of where resources should be found, and dependents project will be able to work without any more configuration.

# Usage

The transformer accepts the following parameters:

- `assetsMatch`: a regular expression used to select asset imports, e.g., for all `.png` files, `assetsMatch = "\\.png$"`. This parameter is mandatory.
- `targetName`: a template similar to [Webpack file-loader name](https://webpack.js.org/loaders/file-loader/#name) used to convert the name of the asset. If you defined a `publicPath` in the `output` parameter of `Webpack`, then you will probably need to specify this path here too. This parameter is optional and defaults to `[hash].[ext]`.

There is currently no way of declaring a transformer in the vanilla _TypeScript_ compiler. If you do not want to write your own compiler using the `typescript` API, you can use the [ttypescript](https://www.npmjs.com/package/ttypescript) wrapper.

## Code

Your TypeScript code should already be well written if you are using `Webpack` and the `file-loader`. If not, you can follow the instructions below.

### Module declaration

Before using them, you need to declare the new module types, for example in an `assets.d.ts` file like this:

```typescript
declare module '*.png' {
  const content: string
  export default content
}
```

Older versions of `file-loader` (before 5.0.2) where not using a default export. You should then declare module types this way in this case:

```typescript
declare module '*.png' {
  const content: string
  export = content
}
```

### Asset import

When the (module) file is to be used:

```typescript
import image from './image.png'

const url: string = image
```

It is even possible to re-export the asset file:

```typescript
export { default as image } from './image.png'
```

Then, in another file:

```typescript
import { image } from '../images'

const url: string = image
```

For older versions of `file-loader` (before 5.0.2), only namespace import is possible:

```typescript
import * as image from './image.png'

const url: string = image
```

## Configuration with ttypescript

For `ttypescript`, configure your `tsconfig.json`. Example:

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "transform": "ts-transform-asset",
        "assetsMatch": "\\.png$",
        "targetName": "assets/[name]-[hash].[ext]"
      }
    ]
  }
}
```

# Notices

- The transformer will not detect nor modify any `require` statement. It is advised to run it in the `before` phase of the compilation, before the code is converted to an older version of `ECMAScript`.
- The transformer either modify the code if it conforms to what is expected, or do not touch it at all. There is an exception anyway for the re-export declarations: if the source module matches the given parameters, but the exported property is not `default`, then this export property will be removed.
- Please file an issue if you have any problem using the transformer. Even though we cannot guarantee a response time, we will do our best to correct problems or answer questions.
- Contributions (_pull request_) are welcome.

# Migration

## Prior to version 3.x.x

Prior to version 3.x.x, there was a configuration entry `targetPath` which was the prefix used to add to the target asset name. Everything is now defined in the new `targetName` entry. Converting from previous to current configuration is as simple as the below example:

```diff
       "transform": "ts-transform-asset",
       "assetsMatch": "\\.png$",
-      "targetPath": "assets"
+      "targetName": "assets/[name].[ext]"
     }
   ]
```

## Prior to version 2.x.x

In addition to the previous modifications, note that prior to version 2.x.x, transformer was of type `config`. Since version 2.0.0, transformer is of type `program`, which is the default. If you are upgrading from an older version and using `ttypescript`, you have to update the `plugin` configuration in `tsconfig.json`:

```diff
     {
       "transform": "ts-transform-asset",
-      "type": "config",
       "assetsMatch": "\\.png$",
       "targetName": "assets/[name].[ext]"
```
