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
interface FrameType {
  data:{
    [id:number]: {
      label:string,
      position:Position,
      size:Position
    }
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
export type {Payload,State,Action,LinkType,Position,Position4,FrameType,OverlayEffectPayload,EffectType,OverlayEffectTypes}