// tslint:disable:only-arrow-functions (mocha prefers functions)
// tslint:disable:no-unused-expression (chai expression are actually used)
// tslint:disable:no-implicit-dependencies (dev deps are enough for tests)
import { expect } from 'chai'
import { resolve } from 'path'

import compile from './compile.spec'

describe('ts-transform-asset', function() {
  this.slow(2000)
  this.timeout(10000)

  function compileFile(
    testName: string,
    mainFile: string,
    path?: string
  ): boolean {
    return compile(
      testName,
      [
        resolve(__dirname, `../test/${mainFile}.ts`),
        resolve(__dirname, '../test/global.d.ts')
      ],
      '\\.svg$',
      path
    )
  }

  it('should be able to compile asset to root path', function() {
    expect(compileFile('root', 'success')).to.be.true
    expect(require('../dist/test/root/success.js').default()).to.equal(
      'image.svg'
    )
  })

  it('should be able to compile asset to given path', function() {
    expect(compileFile('path', 'success', 'assets')).to.be.true
    expect(require('../dist/test/path/success.js').default()).to.equal(
      'assets/image.svg'
    )
  })

  it('should fail to compile bad files', function() {
    expect(compileFile('fail', 'failure')).to.be.false
  })
})
