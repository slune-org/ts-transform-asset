import { Identifier, Node, NodeFlags, isIdentifier, updateIdentifier } from 'typescript'

import DeclarationNodeFinder from './DeclarationNodeFinder'
import NodeVisitor from './NodeVisitor'

/**
 * Identifier visitor prevents default process from replacing identifiers if we modified its declaration.
 */
export default class IdentifierVisitor implements NodeVisitor<Identifier> {
  /**
   * Create the visitor.
   *
   * @param declarationNode - The declaration node finder.
   * @param modifiedDeclarations - An array with the modified declaration (identifiers must not be touched).
   */
  public constructor(
    private declarationNode: DeclarationNodeFinder,
    private modifiedDeclarations: ReadonlyArray<Node>
  ) {}

  public wantNode(node: Node): node is Identifier {
    return isIdentifier(node)
  }

  public visit(node: Identifier): Node[] {
    const declaration = this.declarationNode.find(node)
    if (declaration) {
      if (this.modifiedDeclarations.includes(declaration)) {
        node.flags |= NodeFlags.Synthesized
        const newNode = updateIdentifier(node)
        return [newNode]
      }
    }
    return [node]
  }
}
