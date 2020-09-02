import type { NodeVisitor } from 'simple-ts-transform'
import type { ExportDeclaration, Node } from 'typescript'
import { NodeFlags, SyntaxKind, isExportDeclaration, isNamedExports } from 'typescript'

import type { TContext } from '../context'

/**
 * This visitor replace re-export by a constant declaration if needed.
 */
export default class ExportReplacer implements NodeVisitor<ExportDeclaration> {
  public constructor(private readonly context: TContext) {}

  public wants(node: Node): node is ExportDeclaration {
    return isExportDeclaration(node)
  }

  public visit(node: ExportDeclaration): Node[] {
    const {
      createExportDefault,
      createStringLiteral,
      createToken,
      createVariableDeclaration,
      createVariableDeclarationList,
      createVariableStatement,
      getGeneratedNameForNode,
    } = this.context.factory
    const moduleName = this.context.moduleManager.buildName(node.moduleSpecifier)
    if (moduleName) {
      if (node.exportClause && isNamedExports(node.exportClause)) {
        const result: Node[] = []
        node.exportClause.elements.forEach(specifier => {
          if (specifier.propertyName && specifier.propertyName.getText() === 'default') {
            result.push(
              createVariableStatement(
                [createToken(SyntaxKind.ExportKeyword)],
                createVariableDeclarationList(
                  [
                    createVariableDeclaration(
                      specifier.name,
                      undefined,
                      undefined,
                      createStringLiteral(moduleName)
                    ),
                  ],
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
                  [
                    createVariableDeclaration(
                      uniqueName,
                      undefined,
                      undefined,
                      createStringLiteral(moduleName)
                    ),
                  ],
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
