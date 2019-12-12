// tslint:disable:only-arrow-functions (mocha prefers functions)
// tslint:disable:no-unused-expression (chai expression are actually used)
// tslint:disable:no-implicit-dependencies (dev deps are enough for tests)
import { expect } from 'chai'
import { resolve } from 'path'

import compile from './compile.spec'

describe('ts-transform-asset', function() {
  this.slow(2000)
  this.timeout(10000)

  function compileFile(testName: string, path?: string): void {
    const files: string[] = [resolve(__dirname, '../test/global.d.ts')]
    files.push(...['success', 'failure', 'reexport'].map(name => resolve(__dirname, `../test/${name}.ts`)))
    compile(testName, files, '\\.(png|svg|ogg)$', path)
  }

  it('should be able to compile asset to root path', function() {
    compileFile('root')
    expect(require('../dist/test/root/success').default('png')).to.equal('image.png')
    expect(require('../dist/test/root/success').default('svg')).to.equal('image.svg')
    expect(require('../dist/test/root/success').default('defaultExport')).to.equal('image.svg')
    expect(require('../dist/test/root/success').default('export')).to.equal('image.svg')
    expect(() => require('../dist/test/root/failure')).to.throw()
  })

  it('should be able to compile asset to given path', function() {
    compileFile('path', 'assets')
    expect(require('../dist/test/path/success').default('png')).to.equal('assets/image.png')
    expect(require('../dist/test/path/success').default('svg')).to.equal('assets/image.svg')
    expect(require('../dist/test/path/success').default('defaultExport')).to.equal('assets/image.svg')
    expect(require('../dist/test/path/success').default('export')).to.equal('assets/image.svg')
    expect(() => require('../dist/test/path/failure')).to.throw()
  })
})
