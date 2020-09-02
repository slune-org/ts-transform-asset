import type { NodeVisitor } from 'simple-ts-transform'
import type { ImportClause, ImportDeclaration, NamespaceImport, Node } from 'typescript'
import {
  NodeFlags,
  getSourceMapRange,
  isImportDeclaration,
  isNamespaceImport,
  setSourceMapRange,
} from 'typescript'

import type { TContext } from '../context'

/**
 * This visitor replace import by a constant declaration if needed.
 */
export default class ImportReplacer implements NodeVisitor<ImportDeclaration> {
  public constructor(private readonly context: TContext) {}

  public wants(node: Node): node is ImportDeclaration {
    return isImportDeclaration(node)
  }

  public visit(node: ImportDeclaration): Node[] {
    const {
      createStringLiteral,
      createVariableDeclaration,
      createVariableDeclarationList,
      createVariableStatement,
    } = this.context.factory
    const moduleName = this.context.moduleManager.buildName(node.moduleSpecifier)
    if (moduleName) {
      // Get the import clause, and continue if needs to be modified
      const importClause: ImportClause | undefined = node.importClause
      if (
        importClause &&
        ((importClause.namedBindings && isNamespaceImport(importClause.namedBindings)) || importClause.name)
      ) {
        // Create import replacement
        const identifier = importClause.name || (importClause.namedBindings as NamespaceImport).name
        const declaration = this.context.declarationNode.find(identifier)
        declaration && this.context.modifiedImports.push(declaration)
        const variableDeclaration = createVariableDeclaration(
          identifier,
          undefined,
          undefined,
          createStringLiteral(moduleName)
        )
        const newNode = createVariableStatement(
          undefined,
          createVariableDeclarationList([variableDeclaration], NodeFlags.Const)
        )
        setSourceMapRange(newNode, getSourceMapRange(importClause))
        return [newNode]
      }
    }
    return [node]
  }
}
