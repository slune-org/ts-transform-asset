import {
  Node,
  Program,
  SourceFile,
  TransformationContext,
  Transformer,
  TransformerFactory,
  TypeChecker,
  Visitor,
  visitEachChild,
  visitNode,
} from 'typescript'

import AssetModuleManager from './AssetModuleManager'
import DeclarationNodeFinder from './DeclarationNodeFinder'
import ExportVisitor from './ExportVisitor'
import IdentifierVisitor from './IdentifierVisitor'
import ImportVisitor from './ImportVisitor'
import NodeVisitor from './NodeVisitor'
import PluginConfig from './PluginConfig'

function buildVisitor(
  typeChecker: TypeChecker,
  ctx: TransformationContext,
  assetsMatch: RegExp,
  targetName: string,
  filename: string,
  basePath: string
) {
  const modifiedImports: Node[] = []
  const declarationNode = new DeclarationNodeFinder(typeChecker)
  const moduleManager = new AssetModuleManager(assetsMatch, targetName, filename, basePath)
  const allVisitors: Array<NodeVisitor<Node>> = [
    new ImportVisitor(declarationNode, moduleManager, modifiedImports),
    new ExportVisitor(moduleManager),
    new IdentifierVisitor(declarationNode, modifiedImports),
  ]

  const visitor: Visitor = (node: Node): undefined | Node | Node[] => {
    const newNodes = allVisitors.reduce(
      (nodes, nodeVisitor) => {
        return visit(nodeVisitor, nodes)
      },
      [node]
    )
    return newNodes.length === 0
      ? undefined
      : newNodes.length === 1
      ? visitEachChild(newNodes[0], visitor, ctx)
      : newNodes.map(newNode => visitEachChild(newNode, visitor, ctx))
  }

  function visit<T extends Node>(nodeVisitor: NodeVisitor<T>, nodes: Node[]): Node[] {
    const nextNodes: Node[] = []
    nodes.forEach(node => {
      if (nodeVisitor.wantNode(node)) {
        nextNodes.push(...nodeVisitor.visit(node))
      } else {
        nextNodes.push(node)
      }
    })
    return nextNodes
  }

  return visitor
}

export default function(program: Program, pluginConfig: PluginConfig): TransformerFactory<SourceFile> {
  const assetsMatch = new RegExp(pluginConfig.assetsMatch)
  const targetName = pluginConfig.targetName || '[hash].[ext]'
  const basePath = program.getCompilerOptions().rootDir || program.getCurrentDirectory()
  return (ctx: TransformationContext): Transformer<SourceFile> => (sf: SourceFile) =>
    visitNode(
      sf,
      buildVisitor(program.getTypeChecker(), ctx, assetsMatch, targetName, sf.fileName, basePath)
    )
}
