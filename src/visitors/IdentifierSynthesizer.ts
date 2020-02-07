import { NodeVisitor } from 'simple-ts-transform'
import { Identifier, Node, NodeFlags, isIdentifier, updateIdentifier } from 'typescript'

import { TContext } from '../context'

/**
 * This visitor prevents default process from replacing identifiers if we modified its declaration.
 */
export default class IdentifierSynthesizer implements NodeVisitor<Identifier> {
  public constructor(private readonly context: TContext) {}

  public wants(node: Node): node is Identifier {
    return isIdentifier(node)
  }

  public visit(node: Identifier): Node[] {
    const declaration = this.context.declarationNode.find(node)
    if (declaration) {
      if (this.context.modifiedImports.includes(declaration)) {
        node.flags |= NodeFlags.Synthesized
        const newNode = updateIdentifier(node)
        return [newNode]
      }
    }
    return [node]
  }
}
