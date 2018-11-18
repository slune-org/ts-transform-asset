import { basename, join } from 'path'
import {
  ImportClause,
  Node,
  NodeFlags,
  SourceFile,
  TransformationContext,
  Transformer,
  TransformerFactory,
  Visitor,
  createLiteral,
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement,
  isImportDeclaration,
  isNamespaceImport,
  visitEachChild,
  visitNode,
} from 'typescript'

export interface Opts {
  assetsMatch: string
  targetPath?: string
}

function buildVisitor(ctx: TransformationContext, opts: Opts) {
  const matcher: RegExp = new RegExp(opts.assetsMatch)
  const visitor: Visitor = (node: Node): Node => {
    // Continue only for import nodes
    if (!isImportDeclaration(node)) {
      return visitEachChild(node, visitor, ctx)
    }

    // Extract module name and remove quotes
    let moduleName: string = node.moduleSpecifier.getText()
    moduleName = moduleName.substring(1, moduleName.length - 1)

    // Continue only if matching assets pattern
    if (!matcher.test(moduleName)) {
      return visitEachChild(node, visitor, ctx)
    }

    // Convert file name
    moduleName = basename(moduleName)
    opts.targetPath && (moduleName = join(opts.targetPath, moduleName))

    // Get the import clause, and continue only if existing
    const importClause: ImportClause | undefined = node.importClause
    if (!importClause) {
      return visitEachChild(node, visitor, ctx)
    }

    // Extract variable name
    let importVar: string | undefined
    if (
      importClause.namedBindings &&
      isNamespaceImport(importClause.namedBindings)
    ) {
      importVar = importClause.namedBindings.name.getText()
    } else if (!importClause.namedBindings && importClause.name) {
      importVar = importClause.name.getText()
    }
    if (!importVar) {
      return visitEachChild(node, visitor, ctx)
    }

    // Create replacement
    return createVariableStatement(
      undefined,
      createVariableDeclarationList(
        [
          createVariableDeclaration(
            importVar,
            undefined,
            createLiteral(moduleName)
          )
        ],
        NodeFlags.Const
      )
    )
  }

  return visitor
}

export default function(opts: Opts): TransformerFactory<SourceFile> {
  return (ctx: TransformationContext): Transformer<SourceFile> => (
    sf: SourceFile
  ) => visitNode(sf, buildVisitor(ctx, opts))
}
