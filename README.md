[![npm package](https://badge.fury.io/js/ts-transform-asset.svg)](https://www.npmjs.com/package/ts-transform-asset)
[![license](https://img.shields.io/github/license/sveyret/ts-transform-asset.svg)](https://github.com/sveyret/ts-transform-asset/blob/master/LICENSE)
[![build](https://api.travis-ci.org/sveyret/ts-transform-asset.svg?branch=master)](https://travis-ci.org/sveyret/ts-transform-asset)
[![coverage](https://coveralls.io/repos/github/sveyret/ts-transform-asset/badge.svg?branch=master)](https://coveralls.io/github/sveyret/ts-transform-asset)
[![issues](https://img.shields.io/github/issues/sveyret/ts-transform-asset.svg)](https://github.com/sveyret/ts-transform-asset/issues)

# ts-transform-asset - Typescript transformer for asset imports

## Pupose

This transformer will simply convert an import like:

```typescript
import * as foo from "../images/bar.png";
```

to:

```typescript
const foo = "assets/bar.png";
```

## But why would I need that?

Imagine you have a project creating some web pages. This project is packed with `Webpack`, creating a `bundle.js`. In the same time, the `Webpack` `file-loader` plugin is moving all assets into the target directory. This is done by setting some `import * as foo from '../images/bar.png` for your assets in source code.

Then, you have another project, which contains the web server. This server, which depends on the previous one, will take all assets and bundle to serve them to the clients. But you also want to do some server side rendering. And for this, you prefer using the transpiled `javascript` and definition files instead of the minified and untyped bundle. But this is not working, because your server do not know what to do with your assets files.

Using this transformer to transpile the web pages (not for `Webpack`!), you will convert your imports into constants with the URL of where resources should be found, and dependents project will be able to work without any more configuration.

# Installation

Installation is done using `npm install` command:

```bash
$ npm install --save-dev ts-transform-asset
```

If you prefer using `yarn`:

```bash
$ yarn add --dev ts-transform-asset
```

# Language/langue

Because French is my native language, finding all documents and messages in French is not an option. Other translations are welcome.

Anyway, because English is the language of programming, the code, including variable names and comments, are in English.

:fr: Une version française de ce document se trouve [ici](doc/fr/README.md).

# Usage

The transformer accepts the following parameters:

- `assetsMatch`: a regular expression used to select asset imports, e.g., for all `.png` files, `assetsMatch = "\\.png$"`. This parameter is mandatory.
- `targetPath`: a path which is prefixed to the file name, i.e. the same as the `publicPath` you may have defined in the `output` parameter of `Webpack`. This parameter is optional.

There is currently no way of declaring a transformer in the vanilla `typescript` compiler. If you do not want to write your own compiler using the `typescript` API, you can use the `ttypescript` wrapper. Below is explained how.

## Installation

First of all, you need to install `ttypescript`, either with `npm`:

```bash
$ npm install --save-dev ttypescript
```

or with `yarn`:

```bash
$ yarn add --dev ttypescript
```

## Configuration

Then, configure your `tsconfig.json`

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "transform": "ts-transform-asset",
        "type": "config",
        "assetsMatch": "\\.png$",
        "targetPath": "assets"
      }
    ]
  }
}
```
