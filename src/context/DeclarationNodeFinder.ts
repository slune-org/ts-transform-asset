import type { Identifier, Node, TypeChecker } from 'typescript'

/**
 * An object searching for a declaration node for a given identifier.
 */
export default class DeclarationNodeFinder {
  /**
   * Create the object.
   *
   * @param typeChecker - The type checker.
   */
  public constructor(private readonly typeChecker: TypeChecker) {}

  /**
   * Search for the declaration node of a given identifier.
   *
   * @param node - The node to search declaration for.
   * @returns The declaration node if found, undefined otherwise.
   */
  public find(node: Identifier): Node | undefined {
    const symbol = this.typeChecker.getSymbolAtLocation(node)
    if (symbol) {
      const declarations = symbol.getDeclarations()
      /* istanbul ignore else */
      if (declarations && declarations.length === 1) {
        return declarations[0]
      }
    }
    return undefined
  }
}
