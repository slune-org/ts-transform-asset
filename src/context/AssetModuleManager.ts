import { HexBase64Latin1Encoding, createHash } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import { basename, join, parse, relative, sep } from 'path'
import { Expression } from 'typescript'

/**
 * Asset module manager can be used to detect asset modules and build a module name from a module
 * specifier.
 */
export default class AssetModuleManager {
  /**
   * Create the object.
   *
   * @param assetsMatch - The regular expression for detecting matching modules.
   * @param targetName - The public target name to use for the assets.
   * @param currentPath - The directory of the current file, root of module search.
   * @param basePath - The base path of the project.
   */
  public constructor(
    private readonly assetsMatch: RegExp,
    private readonly targetName: string,
    private readonly currentPath: string,
    private readonly basePath: string
  ) {}

  /**
   * Build the module name as it should be used inside source file, if the module specifier matches the
   * given `assetsMatch`.
   *
   * @param moduleSpecifier - The module specifier.
   * @returns The build module name or undefined if not matching.
   */
  public buildName(moduleSpecifier?: Expression): string | undefined {
    /* istanbul ignore else */
    if (moduleSpecifier) {
      // Remove quotes for name
      let moduleName: string = moduleSpecifier.getText()
      moduleName = moduleName.substring(1, moduleName.length - 1)

      // Check if matching assets pattern
      if (this.assetsMatch.test(moduleName)) {
        return this.interpolateName(moduleName)
      }
    }
    return undefined
  }

  /**
   * Create the asset name using `targetName` template and given module name.
   *
   * @param moduleName - The name of module to use as interpolation source.
   * @returns The asset name.
   */
  private interpolateName(moduleName: string) {
    const modulePath = join(this.currentPath, moduleName)
    const parsed = parse(modulePath)
    /* istanbul ignore next */
    const ext = parsed.ext ? parsed.ext.substr(1) : 'bin'
    /* istanbul ignore next */
    const filename = parsed.name || 'file'

    let directory =
      relative(this.basePath, parsed.dir)
        .replace(/\\/g, '/')
        .replace(/\.\.(\/)?/g, '_$1') + sep
    let folder = ''
    if (directory.length === 1) {
      directory = ''
    } else {
      folder = basename(directory)
    }

    let url = this.targetName
    if (existsSync(modulePath)) {
      const content = readFileSync(modulePath)
      url = url.replace(
        /\[(?:([^:\]]+):)?(?:hash|contenthash)(?::([a-z]+\d*))?(?::(\d+))?\]/gi,
        (_, hashType: string, digestType: HexBase64Latin1Encoding | '', maxLength: string) => {
          const hash = createHash(hashType || 'md5')
          hash.update(content)
          return hash.digest(digestType || 'hex').substr(0, parseInt(maxLength, 10) || 9999)
        }
      )
    }

    url = url
      .replace(/\[ext\]/gi, ext)
      .replace(/\[name\]/gi, filename)
      .replace(/\[path\]/gi, directory)
      .replace(/\[folder\]/gi, folder)
    return url
  }
}
