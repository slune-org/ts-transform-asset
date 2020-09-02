import * as pngImage from './sub/folder/image.png'
import svgImage from './image.svg'
import moduleImage from 'module/image.svg'
import defaultImage from './reexport'
import { image } from './reexport'

export default function getPath(
  type: 'fullImport' | 'defaultImport' | 'moduleImport' | 'defaultExport' | 'namedExport'
): string {
  switch (type) {
    case 'fullImport':
      return pngImage
    case 'defaultImport':
      return svgImage
    case 'moduleImport':
      return moduleImage
    case 'defaultExport':
      return defaultImage
    case 'namedExport':
      return image
  }
}

export { image } from './reexport'
