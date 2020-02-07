import buildTransformer from 'simple-ts-transform'

import { TContext } from './context'
import { ExportReplacer, IdentifierSynthesizer, ImportReplacer } from './visitors'

const transformer = buildTransformer(TContext, [ImportReplacer, ExportReplacer, IdentifierSynthesizer])
export default transformer
