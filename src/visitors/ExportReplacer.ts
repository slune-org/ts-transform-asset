import { NodeVisitor } from 'simple-ts-transform'
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

import { TContext } from '../context'

/**
 * This visitor replace re-export by a constant declaration if needed.
 */
export default class ExportReplacer implements NodeVisitor<ExportDeclaration> {
  public constructor(private readonly context: TContext) {}

  public wants(node: Node): node is ExportDeclaration {
    return isExportDeclaration(node)
  }

  public visit(node: ExportDeclaration): Node[] {
    const moduleName = this.context.moduleManager.buildName(node.moduleSpecifier)
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
