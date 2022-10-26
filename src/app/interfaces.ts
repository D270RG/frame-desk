interface Position{
  x:number,
  y:number
}
interface Position4{
  x1:number,
  y1:number,
  x2:number,
  y2:number
}
interface LinkType{
  frame1:number,
  frame2:number
}
interface EmbedData{
  type:string,
  url:string,
  maxSizes:{
    x:number,
    y:number
  }
}
interface FrameElement {
    label:string,
    embedLink:EmbedData|null,
    position:Position,
    size:Position
}
interface FrameType {
  data:{
    [id:number]: FrameElement
  },
  keys:number[]
}
interface EffectType {
  data:{
    [id:string]: OverlayEffectPayload
  },
  keys:string[]
}
interface State{
    frames?:FrameType,
    links?:LinkType[],
    ids?:number[],
    editId?:number|null
  }
interface Payload{
    ids?:number[],
    id?:number|null,
    id1?:number,
    id2?:number,
    label?:string,
    embedLink?:EmbedData|null,
    maxSizes?:Position,
    coordinate?:string,
    maxSize?:number,
    sizesDelta?:Position,
    scale?:number,
    type?:string,
    url?:string,
    position?:Position,
    size?:Position,
    link?:LinkType,
    selectedIds?:number[]
}
interface OverlayEffectTypes{
  types:'pseudolinkEffect'|'selectionBoxEffect'|'dragEffect'
}
interface OverlayEffectPayload{
   type?:OverlayEffectTypes['types'],
   id?:number,
   isActive?:boolean,
   startPos?:Position,
   endPos?:Position

   ids?:number[]
}
interface Action{
  type:string,
  payload:Payload
}
export type {Payload,State,Action,LinkType,Position,Position4,FrameType,FrameElement,OverlayEffectPayload,EffectType,OverlayEffectTypes,EmbedData}