import * as pngImage from './image.png'
import svgImage from './image.svg'
import defaultImage from './reexport'
import { image } from './reexport'

export default function getPath(type: 'png' | 'svg' | 'defaultExport' | 'export'): string {
  switch (type) {
    case 'png':
      return pngImage
    case 'svg':
      return svgImage
    case 'defaultExport':
      return defaultImage
    case 'export':
      return image
  }
}

export { image } from './reexport'
