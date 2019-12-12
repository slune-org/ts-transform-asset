import { Node } from 'typescript'

export default interface NodeVisitor<T extends Node> {
  wantNode(node: Node): node is T
  visit(node: T): Node[]
}
