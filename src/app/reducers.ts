import { createSlice,configureStore,current  } from "@reduxjs/toolkit"
import type { PayloadAction} from '@reduxjs/toolkit'
import type {LinkType,frameEditType,overlayEffectsType,Action,graphStateType,Payload,Position,OverlayEffectPayload,FrameElement,EmbedData, ImportData, ImportActionPayload} from './interfaces'
import { posOp } from "../PosUtils"

function nextframeId(framesKeys:any) {
  const maxId = framesKeys.reduce((maxId:any, frameKey:any) => Math.max(frameKey, maxId), -1)
  return maxId + 1
}
function posShift(obj:FrameElement,shift:Position){
  return({...obj,
    position: posOp(obj.position,'+',shift)
  });
}
const listenersStateInitialState = {
  scroll:true
}
const graphInitialState = {
  frames:{
    data:{
      0:{label: 'Write something here', embedLink:{type:'image',url:'https://i.imgur.com/mb2vMgH.jpeg',maxSizes:null}, position:{x:100,y:100},size:{x:0,y:0}},
      1:{label: 'Example frame 2',embedLink:null, position:{x:600,y:400},size:{x:0,y:0}},
      2:{label: 'Example frame 3',embedLink:null, position:{x:800,y:200},size:{x:0,y:0}}
    },
    keys:[0,1,2]
  },
  links: [
    { frame1: 0, frame2: 1},
    { frame1: 1, frame2: 2},
  ],
  selectedIds: [] as number[]
}
const frameEditInitialState = {
  editId:null as number|null
}
const zoomInitialState = {
  zoomMultiplier:1.0,
  lastClickPos:{
    x:0,
    y:0
  },
  zoomMode:null as boolean|null
}
const overlayEffectsInitialState = {
  slowMode:true,
  effects:{
      data:{
        pseudolinkEffect:{
          id:-1,
          isActive:false,
          startFrame:null,
          endFrame:null,
          startPos:{x:0,y:0},
          endPos:{x:0,y:0},
          initScroll:{x:0,y:0}
        },
        pseudodragEffect:{
          isActive:false,
          deltaStart:{x:0,y:0},
          deltaEnd:{x:0,y:0},
          size:{x:0,y:0},
          startPos:{x:0,y:0},
          endPos:{x:0,y:0},
          initScroll:{x:0,y:0}
        },
        selectionBoxEffect:{
          isActive:false,
          startPos:{x:0,y:0},
          endPos:{x:0,y:0}
        },
        dragEffect:{
          isActive:false,
          data:{
            // 0:{
            //   startPos:{x:0,y:0},
            //   endPos:{x:0,y:0},
            //   initScroll:{x:0,y:0}
            // }
          },
            keys:[/*0*/]
        }
      }
  }
}
const listenersStateSlice = createSlice({
  name:'listenersState',
  initialState:listenersStateInitialState,
  reducers:{
    setState:(state, action:PayloadAction<Payload>)=>{
      state.scroll = action.payload.state as boolean
    }
  }
});
const zoomSlice = createSlice({
  name: 'zoom',
  initialState: zoomInitialState,
  reducers:{
    importZoom:(state, action:PayloadAction<ImportActionPayload>)=>{
      state.zoomMultiplier = action.payload.dataToImport.zoomMultiplier as number;
    },
    setZoom:(state, action:PayloadAction<Payload>)=>{
      state.zoomMultiplier = action.payload.zoomMultiplier as number;
    },
    zoomIn:(state, action:PayloadAction<Payload>)=>{
        state.zoomMultiplier += 0.1*state.zoomMultiplier;
    },
    zoomOut:(state, action:PayloadAction<Payload>)=>{
        state.zoomMultiplier -= 0.1*state.zoomMultiplier;
    },
    setZoomMode:(state, action:PayloadAction<Payload>)=>{
        state.zoomMode = action.payload.zoomMode as boolean|null
    },
    setPos:(state, action:PayloadAction<Payload>)=>{
        state.lastClickPos= action.payload.lastClickPos as Position
    }
  }
});
const overlayEffectsSlice = createSlice({
  name:'overlayEffects',
  initialState:overlayEffectsInitialState as any,
  reducers:{
    disableAllEffects:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      Object.keys(state.effects.data).forEach((effectKey:string)=>{
        state.effects.data[effectKey].isActive=false;
      });
    },
    effectSetStart:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data[action.payload.type as string].startPos = action.payload.startPos;
    },
    effectSetEnd:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data[action.payload.type as string].endPos = action.payload.endPos;
    },
    effectSetActive:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data[action.payload.type as string].isActive = action.payload.isActive;
    },
    effectSetId:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data[action.payload.type as string].id = action.payload.id;
    },
    pseudodragEffectSetSize:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data['pseudodragEffect'].size = action.payload.size
    },
    pseudodragEffectSetDeltaStart:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data['pseudodragEffect'].deltaStart = action.payload.delta
    },
    pseudodragEffectSetDeltaEnd:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data['pseudodragEffect'].deltaEnd = action.payload.delta
    },
    pseudodragEffectSetInitialScroll:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data['pseudodragEffect'].initScroll = action.payload.initScroll
    },
    dragEffectAdded:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data['dragEffect'].isActive = true;
      state.effects!.data['dragEffect'].data[action.payload.id as number] = {
        startPos:action.payload.startPos,
        endPos:action.payload.endPos,
        initScroll:action.payload.initScroll
      }
      state.effects!.data['dragEffect'].keys.push(action.payload.id as number);
    },
    dragEffectSetEndPos:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data['dragEffect'].draggedFrames.data[action.payload.id as number].endPos = action.payload.endPos
    },
    dragEffectSetStartPos:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data['dragEffect'].data[action.payload.id as number].endPos = action.payload.endPos
    },
    dragEffectSetInitialScroll:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data['dragEffect'].data[action.payload.id as number].initScroll = action.payload.initScroll
    },
    dragEffectsClear:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data['dragEffect'].isActive = false;
      state.effects!.data['dragEffect'].keys.length = 0;
      state.effects!.data['dragEffect'].data = {};
    },

    pseudolinkEffectSetStartFrame:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data['pseudolinkEffect'].startFrame = action.payload.id as number|null
    },
    pseudolinkEffectSetEndFrame:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data['pseudolinkEffect'].endFrame = action.payload.id as number|null
    },
  }
});
const graphSlice = createSlice({
  name:'frameReducer',
  initialState:graphInitialState as any,
  reducers:{
    importState:(state,action:PayloadAction<ImportActionPayload>)=>{
      state.frames.data = action.payload.dataToImport.framesData;
      state.frames.keys = action.payload.dataToImport.framesKeys;
      state.links = action.payload.dataToImport.links;
    },
    embedSetMaxSizes:(state,action:PayloadAction<Payload>)=>{
      state.frames!.data[action.payload.id as number].embedLink!.maxSizes = action.payload!.maxSizes as Position;
    },
    embedSetMaxSize:(state,action:PayloadAction<Payload>)=>{
      switch(action.payload.coordinate){
        case 'x':{
          state.frames!.data[action.payload.id as number].embedLink!.maxSizes.x = action.payload.maxSize as number;
          break;
        }
        case 'y':{
          state.frames!.data[action.payload.id as number].embedLink!.maxSizes.y = action.payload.maxSize as number;
          break;
        }
      }
    },
    embedScaleMaxSize:(state,action:PayloadAction<Payload>)=>{
      switch(action.payload.coordinate){
        case 'x':{
          state.frames!.data[action.payload.id as number].embedLink!.maxSizes.x *= action.payload.scale as number;
          break;
        }
        case 'y':{
          state.frames!.data[action.payload.id as number].embedLink!.maxSizes.y *= action.payload.scale as number;
          break;
        }
        case 'xy':{
          state.frames!.data[action.payload.id as number].embedLink!.maxSizes.x *= action.payload.scale as number;
          state.frames!.data[action.payload.id as number].embedLink!.maxSizes.y *= action.payload.scale as number;
          break;  
        }
      }
    },
    embedAdded:(state,action:PayloadAction<Payload>)=>{
      state.frames!.data[action.payload.id as number].embedLink = 
      {
       type:action.payload.type as string,
       url:action.payload.url as string,
       maxSizes:action.payload.maxSizes as Position
      }
    },
    embedRemoved:(state,action:PayloadAction<Payload>)=>{
      state.frames!.data[action.payload.id as number].embedLink = null;
    },

    elementsSelected:(state,action:PayloadAction<Payload>)=>{
      state.selectedIds =state.selectedIds!.concat(action.payload.ids as number[]);
    },
    elementsSelectedAll:(state,action:PayloadAction<Payload>)=>{
      state.selectedIds = state.frames.keys as number[];
    },
    elementsDeselected:(state,action:PayloadAction<Payload>)=>{
      if(action.payload.ids!.length===0){
        state.selectedIds!.length=0;
      } else {
        state.selectedIds = state.selectedIds!.filter((id:number)=>(
          !action.payload.ids!.includes(id)
          )
        ); 
      }
    },
    elementsSetSelection:(state,action:PayloadAction<Payload>)=>{
      state.selectedIds = action.payload.ids!.slice();
    },

    frameSetSize:(state, action:PayloadAction<Payload>)=>{
      if(state.frames!.keys.includes(action.payload!.id as number)){
        state.frames!.data[action.payload.id as number].size = action.payload.size as Position //dirty hack
      }
    },
    framesZoom:(state, action:PayloadAction<Payload>)=>{
      state.frames!.keys.forEach((id:number)=>{
        let newSize = {
          ...state.frames!.data[id as number].size,
          x: state.frames!.data[id as number].size.x*(action.payload.multiplier as number),
          y: state.frames!.data[id as number].size.y*(action.payload.multiplier as number),
        }
        state.frames!.data[id as number].size = newSize;
      });
    },
    frameAdded:(state, action:PayloadAction<Payload>)=>{
      if(state.frames.keys.length<100){
        let nextFrameId:number = nextframeId(state.frames!.keys as number[]);
        if(action.payload.size != undefined){
          state.frames!.data[nextFrameId] = 
            {
              label: action.payload.label as string,
              embedLink: action.payload.embedLink as EmbedData|null,
              position: action.payload.position as Position,
              size: action.payload.size as Position
            }
          state.frames!.keys.push(nextFrameId);
        } else {
          state.frames!.data[nextFrameId] = 
            {
              label: action.payload.label as string,
              embedLink: action.payload.embedLink as EmbedData|null,
              position: action.payload.position as Position,
              size: {x:0,y:0}
            }
          state.frames!.keys.push(nextFrameId);
        };
        state.selectedIds!.push(nextFrameId);
      }
    },
    framesRemoved:(state, action:PayloadAction<Payload>)=>{
      state.links = state.links!.filter((link:LinkType)=>
        !(action.payload.ids!.includes(link.frame1) || action.payload.ids!.includes(link.frame2))
      ); 
      state.frames!.keys = state.frames!.keys.filter((key:number) => !action.payload.ids!.includes(key));
      action.payload.ids!.forEach((id)=>{
        delete state.frames!.data[id];
      });

    },
    frameRelabelled:(state, action:PayloadAction<Payload>)=>{
      state.frames!.data[action.payload.id as number]!.label = action.payload.label as string;
    },
    frameMoved:(state, action:PayloadAction<Payload>)=>{
      state.frames!.data[action.payload.id as number].position = {
        x: action.payload.position!.x,
        y: action.payload.position!.y
      }
    },
    framesMoved:(state, action:PayloadAction<Payload>)=>{
      for(let i = 0;i<action.payload.ids!.length;i++){
        state.frames!.data[action.payload.ids![i]].position = action.payload.positions![i];
      }
    },
    frameMovedRelative:(state, action:PayloadAction<Payload>)=>{
      state.frames!.data[action.payload.id as number].position = 
      posShift(state.frames!.data[action.payload.id as number].position,
              action.payload!.position!);
    },
    framesMovedRelative:(state, action:PayloadAction<Payload>)=>{
      for(let i = 0;i<action.payload.ids!.length;i++){
        state.frames!.data[action.payload.ids![i]].position = //action.payload.positions![i];

        posShift(state.frames!.data[action.payload.ids![i]].position,
                action.payload.positions![i]);
      }
    },
    framesMovedRelativeSinglePosition:(state, action:PayloadAction<Payload>)=>{
      for(let i = 0;i<action.payload.ids!.length;i++){
        state.frames!.data[action.payload.ids![i]].position = //action.payload.positions![i];

        posOp(state.frames!.data[action.payload.ids![i]].position,'+',
                action.payload.position as Position);
        }
    },
    framesMovedRelativeSinglePositionAll:(state, action:PayloadAction<Payload>)=>{
      for(let i = 0;i<state.frames.keys.length;i++){
        state.frames!.data[state.frames.keys[i]].position = //action.payload.positions![i];

        posOp(state.frames!.data[state.frames.keys[i]].position,'+',
                action.payload.position as Position);
        }
    },
    linkAdded:(state, action:PayloadAction<Payload>)=>{
      if(action.payload.link!.frame1!==undefined && action.payload.link!.frame2!==undefined){
        if(action.payload.link!.frame1>action.payload.link!.frame2){ 
          let buffer = action.payload.link!.frame2;
          action.payload.link!.frame2 = action.payload.link!.frame1;
          action.payload.link!.frame1 = buffer;
        } //swap values, frame1<frame2
        let duplicates = state.links!.filter((link:LinkType)=>((link.frame1==action.payload.link!.frame1)&&(link.frame2==action.payload.link!.frame2)) 
                                                  || ((link.frame1==action.payload.link!.frame2)&&(link.frame2==action.payload.link!.frame1)));
        if((duplicates.length==0)&&(action.payload.link!.frame1!==action.payload.link!.frame2)){
            state.links!.push(action.payload.link as any);
        }
      }
    },
    linkRemoved:(state,action:PayloadAction<Payload>)=>{
      state.links = state.links!.filter((link:LinkType)=>{
          return(!(((link.frame1==action.payload.id1) && (link.frame2==action.payload.id2)) || ((link.frame1==action.payload.id2) && (link.frame2==action.payload.id1))));
        } 
      );
    },
    linkRemovedAll:(state,action:PayloadAction<Payload>)=>{
      state.links = state.links!.filter((link:LinkType)=>
        ((link.frame1!== action.payload.id) && (link.frame2!==action.payload.id))
      ); 
    }
  }
});
const frameEditSlice = createSlice({
  name:'frameEditSlice',
  initialState:frameEditInitialState,
  reducers:{
    frameSetEdit:(state, action:PayloadAction<Payload>)=>{
      state.editId = action.payload!.id as number|null;
    }
  }
})
// const selectionSlice = createSlice({
//   name:'selectionReducers',
//   initialState:selectionInitialState,
//   reducers:{
    
//   }
// });
export {listenersStateSlice,zoomSlice,graphSlice,frameEditSlice,overlayEffectsSlice};