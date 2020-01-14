import * as pngImage from './sub/folder/image.png'
import svgImage from './image.svg'
import defaultImage from './reexport'
import { image } from './reexport'

export default function getPath(
  type: 'fullImport' | 'defaultImport' | 'defaultExport' | 'namedExport'
): string {
  switch (type) {
    case 'fullImport':
      return pngImage
    case 'defaultImport':
      return svgImage
    case 'defaultExport':
      return defaultImage
    case 'namedExport':
      return image
  }
}

export { image } from './reexport'
