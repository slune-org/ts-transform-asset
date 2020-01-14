// tslint:disable
import { expect } from 'chai'
import { resolve } from 'path'

import compile from './compile.spec'

describe('ts-transform-asset', function() {
  this.slow(2000)
  this.timeout(10000)

  function compileFile(testName: string, rootDir: string | undefined, targetName?: string): void {
    const files: string[] = [resolve(__dirname, '../test/global.d.ts')]
    files.push(...['success', 'failure', 'reexport'].map(name => resolve(__dirname, `../test/${name}.ts`)))
    compile(testName, rootDir, files, '\\.(png|svg|ogg)$', targetName)
  }

  ;[
    {
      name: 'root',
      template: '[name].[ext]',
      result: {
        fullImport: 'image.png',
        defaultImport: 'image.svg',
        defaultExport: 'image.svg',
        namedExport: 'image.svg',
      },
    },
    {
      name: 'path',
      template: 'assets/[name].[ext]',
      result: {
        fullImport: 'assets/image.png',
        defaultImport: 'assets/image.svg',
        defaultExport: 'assets/image.svg',
        namedExport: 'assets/image.svg',
      },
    },
    {
      name: 'default',
      result: {
        fullImport: '[hash].png',
        defaultImport: 'b05767c238cb9f989cf3cd8180594878.svg',
        defaultExport: 'b05767c238cb9f989cf3cd8180594878.svg',
        namedExport: 'b05767c238cb9f989cf3cd8180594878.svg',
      },
    },
    {
      name: 'format',
      rootDir: 'test',
      template: '[path][folder]_[hash]-[contenthash].[ext]',
      result: {
        fullImport: 'sub/folder/folder_[hash]-[contenthash].png',
        defaultImport: '_b05767c238cb9f989cf3cd8180594878-b05767c238cb9f989cf3cd8180594878.svg',
        defaultExport: '_b05767c238cb9f989cf3cd8180594878-b05767c238cb9f989cf3cd8180594878.svg',
        namedExport: '_b05767c238cb9f989cf3cd8180594878-b05767c238cb9f989cf3cd8180594878.svg',
      },
    },
    {
      name: 'formatNoRoot',
      template: '[path][folder]_[hash]-[contenthash].[ext]',
      result: {
        fullImport: 'test/sub/folder/folder_[hash]-[contenthash].png',
        defaultImport: 'test/test_b05767c238cb9f989cf3cd8180594878-b05767c238cb9f989cf3cd8180594878.svg',
        defaultExport: 'test/test_b05767c238cb9f989cf3cd8180594878-b05767c238cb9f989cf3cd8180594878.svg',
        namedExport: 'test/test_b05767c238cb9f989cf3cd8180594878-b05767c238cb9f989cf3cd8180594878.svg',
      },
    },
  ].forEach(testCase => {
    describe(`Compile with ${testCase.template || 'default'} template`, function() {
      before(`Compile files to ${testCase.name}`, function() {
        compileFile(testCase.name, testCase.rootDir, testCase.template)
      })

      it('should find full module import file', function() {
        expect(require(`../dist/test/${testCase.name}/success`).default('fullImport')).to.equal(
          testCase.result.fullImport
        )
      })

      it('should find default module import file', function() {
        expect(require(`../dist/test/${testCase.name}/success`).default('defaultImport')).to.equal(
          testCase.result.defaultImport
        )
      })

      it('should find default re-exported file', function() {
        expect(require(`../dist/test/${testCase.name}/success`).default('defaultExport')).to.equal(
          testCase.result.defaultExport
        )
      })

      it('should find named re-exported file', function() {
        expect(require(`../dist/test/${testCase.name}/success`).default('namedExport')).to.equal(
          testCase.result.namedExport
        )
      })

      it('should fail to require bad module', function() {
        expect(() => require(`../dist/test/${testCase.name}/failure`)).to.throw()
      })
    })
  })
})
