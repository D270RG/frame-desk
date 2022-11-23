
interface Position{
  x:number,
  y:number
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
interface graphStateType{
    frames?:FrameType,
    links?:LinkType[],
    selectedIds?:number[],
    editId?:number|null
}
interface frameEditType{
  editId:number|null,
  dragEffect:{
    isActive:boolean
  }
}
interface overlayEffectsType{
  effects:{
    data:{
      pseudolinkEffect:{
        id:number,
        isActive:boolean,
        startPos:Position,
        endPos:Position
      },
      navigationEffect:{
        isActive:boolean,
        startPos:Position,
        endPos:Position
      },
      selectionBoxEffect:{
        isActive:boolean,
        startPos:Position,
        endPos:Position
      }
      dragEffect:{
        data:{
          [number:number]:{
            startPos:Position,
            endPos:Position
          }
        },
        keys:number[]
      }
    }
  }
}
interface Payload{
    state?:boolean,
    zoomMode?:boolean|null,
    ids?:number[],
    id?:number|null,
    id1?:number,
    id2?:number,
    label?:string,
    embedLink?:EmbedData|null,
    multiplier?:number,
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
    selectedIds?:number[],
    positions?:Position[],
    lastClickPos?:Position
}
interface ImportData{
    framesData:Map<number,FrameType>,
    framesKeys:number[],
    links:LinkType[],
    zoomMultiplier:number
}
interface ImportActionPayload{
    dataToImport:ImportData;
}
interface OverlayEffectTypes{
  types:'pseudolinkEffect'|'selectionBoxEffect'|'dragEffect'|'pseudodragEffect'
}
interface OverlayEffectPayload{
   type?:OverlayEffectTypes['types'],
   id?:number|null,
   isActive?:boolean,
   startPos?:Position,
   endPos?:Position,

   delta?:Position,
   size?:Position,
   ids?:number[]
}
interface Action{
  type:string,
  payload:Payload
}
export type {frameEditType,overlayEffectsType,Payload,graphStateType,
             Action,LinkType,Position,FrameType,FrameElement,OverlayEffectPayload,
             EffectType,OverlayEffectTypes,EmbedData,ImportData,ImportActionPayload}