import { createSlice,configureStore  } from "@reduxjs/toolkit"
import type { PayloadAction} from '@reduxjs/toolkit'
import type {Action,State,Payload,Position,OverlayEffectPayload} from './interfaces'

function nextframeId(frames:Array<any>) {
  const maxId = frames.reduce((maxId, frame) => Math.max(frame.id, maxId), -1)
  return maxId + 1
}

const graphInitialState:State = {
  frames:{
    data:{
      0:{label: 'Learn React', position:{x:100,y:100},size:{x:0,y:0}},
      1:{label: 'Learn Redux! Very large text type some more here, also breaks many lines', position:{x:200,y:500},size:{x:0,y:0}},
      2:{label: 'Build something fun! Large text', position:{x:500,y:100},size:{x:0,y:0}}
    },
    keys:[0,1,2]
  },
  links: [
    { frame1: 0, frame2: 1},
    { frame1: 1, frame2: 2},
  ]
}
const selectionInitialState:State = {
  ids: [] as number[]
}
const overlayEffectsInitialState:any ={
  effects:{
      data:{
        'pseudolinkEffect':{
          id:0,
          isActive:false,
          startPos:{x:0,y:0},
          endPos:{x:0,y:0}
        },
        'selectionBoxEffect':{
          isActive:false,
          startPos:{x:0,y:0},
          endPos:{x:0,y:0}
        },
        'dragEffect':{
          isActive:false,
          draggedFrames:{
            data:{
              0:{
                startPos:{x:0,y:0},
                endPos:{x:0,y:0}
              }
            },
              keys:[0]
          }
        }
      },
      keys:['pseudolinkEffect','selectionBoxEffect','dragEffect']
  }
}
const overlayEffectsSlice = createSlice({
  name:'overlayEffects',
  initialState:overlayEffectsInitialState,
  reducers:{
    addEffect:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      // state.effects!.data[action.type] = {
        //TODO
      // };
      // state.effects!.keys.push(action.payload.type);
    },
    disableAllEffects:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects.keys.forEach((effectKey:string)=>{
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
    //specific actions
    dragEffectAdded:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data['dragEffect'].draggedFrames.data[action.payload.id as number] = {
        startPos:action.payload.startPos,
        endPos:action.payload.endPos
      }
      state.effects!.data['dragEffect'].draggedFrames.keys.push(action.payload.id as number);
    },
    dragEffectSetEndPos:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data['dragEffect'].draggedFrames.data[action.payload.id as number].endPos = action.payload.endPos
    },
    dragEffectSetStartPos:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data['dragEffect'].draggedFrames.data[action.payload.id as number].endPos = action.payload.endPos
    },
    dragEffectsClear:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data['dragEffect'].draggedFrames.keys.length = 0;
      state.effects!.data['dragEffect'].draggedFrames.data = {};
    }
    // effectUnsetIds:(state,action:PayloadAction<Payload>)=>{
    //   if(action.payload.selectedIds!.length===0){
    //     console.log('deselect all');
    //     state.ids!.length=0;
    //   } else {
    //     console.log('deselect id',action.payload.selectedIds);
    //     state.ids!.filter((id:number)=>(
    //       action.payload.selectedIds!.includes(id)
    //       )
    //     ); 
    //   }
    // }
  }
});

const graphSlice = createSlice({
  name:'frameReducer',
  initialState:graphInitialState,
  reducers:{
    frameSetSize:(state, action:PayloadAction<Payload>)=>{
      state.frames!.data[action.payload.id as number].size = action.payload.size as Position
    },
    frameAdded:(state, action:PayloadAction<Payload>)=>{
      var nextFrameId:number = nextframeId(state.frames!.keys as number[]);
      state.frames!.data[nextFrameId] = 
        {
          label: action.payload.label as string,
          position: action.payload.position as Position,
          size: {x:0,y:0}
        }
      state.frames!.keys.push(nextFrameId);
    },
    framesRemoved:(state, action:PayloadAction<Payload>)=>{
      state.links = state.links!.filter(link=>
        !(action.payload.ids!.includes(link.frame1) || action.payload.ids!.includes(link.frame2))
      ); 

      action.payload.ids!.forEach((id)=>{
        delete state.frames!.data[id];

      });
      state.frames!.keys = state.frames!.keys.filter((key) => !action.payload.ids!.includes(key));
    },
    // frameRelabelled:(state, action:PayloadAction<Payload>)=>{
    //   state.frames!.at(action.payload.id as number)!.label = action.payload.label as string;
    // },
    frameMoved:(state, action:PayloadAction<Payload>)=>{
      state.frames!.data[action.payload.id as number].position = {
        x: action.payload.position!.x,
        y: action.payload.position!.y
      }
    },

    linkAdded:(state, action:PayloadAction<Payload>)=>{
      if(action.payload.link!.frame1>action.payload.link!.frame2){ 
        var buffer = action.payload.link!.frame2;
        action.payload.link!.frame2 = action.payload.link!.frame1;
        action.payload.link!.frame1 = buffer;
      } //swap values, frame1<frame2
      var duplicates = state.links!.filter(link=>((link.frame1==action.payload.link!.frame1)&&(link.frame2==action.payload.link!.frame2)) 
                                                || ((link.frame1==action.payload.link!.frame2)&&(link.frame2==action.payload.link!.frame1)));
      if((duplicates.length==0)&&(action.payload.link!.frame1!==action.payload.link!.frame2)){
          state.links!.push(action.payload.link as any);
      }
    },
    linkRemoved:(state,action:PayloadAction<Payload>)=>{
      console.log(state.links!.length);
      state.links = state.links!.filter(link=>{
          return(!(((link.frame1==action.payload.id1) && (link.frame2==action.payload.id2)) || ((link.frame1==action.payload.id2) && (link.frame2==action.payload.id1))));
        } 
      );
      console.log(state.links!.length);
    },
    linkRemovedAll:(state,action:PayloadAction<Payload>)=>{
      state.links = state.links!.filter(link=>
        ((link.frame1!== action.payload.id) && (link.frame2!==action.payload.id))
      ); 
    }
  }
});
const selectionSlice = createSlice({
  name:'selectionReducers',
  initialState:selectionInitialState,
  reducers:{
    elementsSelected:(state,action:PayloadAction<Payload>)=>{
      state.ids =state.ids!.concat(action.payload.selectedIds as number[]);
    },
    elementsDeselected:(state,action:PayloadAction<Payload>)=>{
      if(action.payload.selectedIds!.length===0){
        console.log('deselect all');
        state.ids!.length=0;
      } else {
        console.log('deselect id',action.payload.selectedIds);
        state.ids!.filter((id:number)=>(
          action.payload.selectedIds!.includes(id)
          )
        ); 
      }
    }
  }
});
export {graphSlice,selectionSlice,overlayEffectsSlice};