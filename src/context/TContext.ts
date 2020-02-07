import { dirname } from 'path'
import { NodeVisitorContext } from 'simple-ts-transform'
import { Node, Program, SourceFile } from 'typescript'

import AssetModuleManager from './AssetModuleManager'
import DeclarationNodeFinder from './DeclarationNodeFinder'

/**
 * Throw an error because of configuration problem.
 *
 * @param message - The message for the configuration error.
 */
function configurationError(message: string): never {
  throw new Error(`Error in transformer configuration: ${message}`)
}

/**
 * Assert that the provided configuration is correct.
 *
 * @param configuration - The configuration to test.
 */
function assertIsConfiguration(
  configuration: any
): asserts configuration is { assetsMatch: string; targetName?: string } {
  if (typeof configuration !== 'object') {
    configurationError('configuration must be an object')
  }
  if (!('assetsMatch' in configuration)) {
    configurationError('missing “assetsMatch” entry')
  }
  if (typeof configuration.assetsMatch !== 'string') {
    configurationError('“assetsMatch” must be a string')
  }
  if (!!configuration.targetName && typeof configuration.targetName !== 'string') {
    configurationError('“targetName” must be a string')
  }
}

/**
 * Context for the transformer.
 */
export default class TContext implements NodeVisitorContext {
  /**
   * The regular expression used to detect appropriate assets.
   */
  private readonly assetsMatch: RegExp

  /**
   * The name of the target to use as import replacement.
   */
  private readonly targetName: string

  /**
   * The base path for the compilation.
   */
  private readonly basePath: string

  /**
   * The imports modified in the file currently being visited.
   */
  private currentModifiedImports: Node[] = []

  /**
   * The module manager for the file currently being visited.
   */
  private currentModuleManager?: AssetModuleManager

  /**
   * The type checker.
   */
  public readonly declarationNode: DeclarationNodeFinder

  /**
   * Create the context.
   *
   * @param program - The program object.
   * @param configuration - The provided configuration.
   */
  public constructor(program: Program, configuration: any) {
    assertIsConfiguration(configuration)
    this.assetsMatch = new RegExp(configuration.assetsMatch)
    this.targetName = configuration.targetName || '[hash].[ext]'
    this.basePath = program.getCompilerOptions().rootDir ?? program.getCurrentDirectory()
    this.declarationNode = new DeclarationNodeFinder(program.getTypeChecker())
  }

  public initNewFile(_context: any, sourceFile: SourceFile): void {
    this.currentModifiedImports = []
    this.currentModuleManager = new AssetModuleManager(
      this.assetsMatch,
      this.targetName,
      dirname(sourceFile.fileName),
      this.basePath
    )
  }

  public get modifiedImports(): Node[] {
    return this.currentModifiedImports
  }

  public get moduleManager(): AssetModuleManager {
    /* istanbul ignore if */
    if (!this.currentModuleManager) {
      throw new Error('Asset module manager is being called before initialization')
    }
    return this.currentModuleManager
  }
}
