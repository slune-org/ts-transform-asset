declare module '*.png' {
  var content: string
  export = content
}
declare module '*.svg' {
  var content: string
  export default content
}
declare module '*.bmp' {
  var content: { default: string }
  export = content
}
declare module '*.ogg' {
  var content: { ogg: string }
  export = content
}
