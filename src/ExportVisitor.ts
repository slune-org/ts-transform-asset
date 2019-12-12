import {
  ExportDeclaration,
  Node,
  NodeFlags,
  SyntaxKind,
  createExportDefault,
  createStringLiteral,
  createToken,
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement,
  getGeneratedNameForNode,
  isExportDeclaration,
} from 'typescript'

import AssetModuleManager from './AssetModuleManager'
import NodeVisitor from './NodeVisitor'

/**
 * Export visitor check if re-export needs to be replaced by a constant declaration.
 */
export default class ExportVisitor implements NodeVisitor<ExportDeclaration> {
  /**
   * Create the visitor.
   *
   * @param moduleManager - The asset module manager.
   */
  public constructor(private moduleManager: AssetModuleManager) {}

  public wantNode(node: Node): node is ExportDeclaration {
    return isExportDeclaration(node)
  }

  public visit(node: ExportDeclaration): Node[] {
    const moduleName = this.moduleManager.buildName(node.moduleSpecifier)
    if (moduleName) {
      if (node.exportClause) {
        const result: Node[] = []
        node.exportClause.elements.forEach(specifier => {
          if (specifier.propertyName && specifier.propertyName.getText() === 'default') {
            result.push(
              createVariableStatement(
                [createToken(SyntaxKind.ExportKeyword)],
                createVariableDeclarationList(
                  [createVariableDeclaration(specifier.name, undefined, createStringLiteral(moduleName))],
                  NodeFlags.Const
                )
              )
            )
          } else if (specifier.name.getText() === 'default') {
            const uniqueName = getGeneratedNameForNode(node)
            result.push(
              createVariableStatement(
                undefined,
                createVariableDeclarationList(
                  [createVariableDeclaration(uniqueName, undefined, createStringLiteral(moduleName))],
                  NodeFlags.Const
                )
              )
            )
            result.push(createExportDefault(uniqueName))
          }
        })
        return result
      }
    }
    return [node]
  }
}
