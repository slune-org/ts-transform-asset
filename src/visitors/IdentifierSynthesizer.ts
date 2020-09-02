import type { NodeVisitor } from 'simple-ts-transform'
import type { Identifier, Node } from 'typescript'
import { isIdentifier } from 'typescript'

import type { TContext } from '../context'

/**
 * This visitor prevents default process from replacing identifiers if we modified its declaration.
 */
export default class IdentifierSynthesizer implements NodeVisitor<Identifier> {
  public constructor(private readonly context: TContext) {}

  public wants(node: Node): node is Identifier {
    return isIdentifier(node)
  }

  public visit(node: Identifier): Node[] {
    const { createIdentifier } = this.context.factory
    const declaration = this.context.declarationNode.find(node)
    if (declaration) {
      if (this.context.modifiedImports.includes(declaration)) {
        return [createIdentifier(node.text)]
      }
    }
    return [node]
  }
}
