import { basename, join } from 'path'
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
   * @param targetPath - The public target path for the assets.
   */
  public constructor(private assetsMatch: RegExp, private targetPath?: string) {}

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
        // Convert file name
        moduleName = basename(moduleName)
        this.targetPath && (moduleName = join(this.targetPath, moduleName))
        return moduleName
      }
    }
    return undefined
  }
}
