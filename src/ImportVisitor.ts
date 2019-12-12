import {
  ImportClause,
  ImportDeclaration,
  NamespaceImport,
  Node,
  NodeFlags,
  createStringLiteral,
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement,
  getSourceMapRange,
  isImportDeclaration,
  isNamespaceImport,
  setSourceMapRange,
} from 'typescript'

import AssetModuleManager from './AssetModuleManager'
import DeclarationNodeFinder from './DeclarationNodeFinder'
import NodeVisitor from './NodeVisitor'

/**
 * Import visitor check if import needs to be replaced by a constant declaration.
 */
export default class ImportVisitor implements NodeVisitor<ImportDeclaration> {
  /**
   * Create the visitor.
   *
   * @param declarationNode - The declaration node finder.
   * @param moduleManager - The asset module manager.
   * @param modifiedNodes - An array to record the modified imports.
   */
  public constructor(
    private declarationNode: DeclarationNodeFinder,
    private moduleManager: AssetModuleManager,
    private modifiedNodes: Node[]
  ) {}

  public wantNode(node: Node): node is ImportDeclaration {
    return isImportDeclaration(node)
  }

  public visit(node: ImportDeclaration): Node[] {
    const moduleName = this.moduleManager.buildName(node.moduleSpecifier)
    if (moduleName) {
      // Get the import clause, and continue if needs to be modified
      const importClause: ImportClause | undefined = node.importClause
      if (
        importClause &&
        ((importClause.namedBindings && isNamespaceImport(importClause.namedBindings)) || importClause.name)
      ) {
        // Create import replacement
        const identifier = importClause.name || (importClause.namedBindings as NamespaceImport).name
        const declaration = this.declarationNode.find(identifier)
        declaration && this.modifiedNodes.push(declaration)
        const variableDeclaration = createVariableDeclaration(
          identifier,
          undefined,
          createStringLiteral(moduleName)
        )
        identifier.parent = variableDeclaration
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
