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
  ): void {
    const files: string[] = [
      resolve(__dirname, `../test/${mainFile}.ts`),
      resolve(__dirname, '../test/global.d.ts')
    ]
    compile(testName, files, '\\.svg$', path)
  }

  it('should be able to compile asset to root path', function() {
    compileFile('root', 'success')
    expect(require('../dist/test/root/success').default()).to.equal(
      'image.svg'
    )
  })

  it('should be able to compile asset to given path', function() {
    compileFile('path', 'success', 'assets')
    expect(require('../dist/test/path/success').default()).to.equal(
      'assets/image.svg'
    )
  })

  it('should fail to execute bad files', function() {
    compileFile('fail', 'failure')
    expect(() => require('../dist/test/fail/failure')).to.throw()
  })
})
