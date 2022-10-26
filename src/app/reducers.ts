import { createSlice,configureStore  } from "@reduxjs/toolkit"
import type { PayloadAction} from '@reduxjs/toolkit'
import type {Action,State,Payload,Position,OverlayEffectPayload,FrameElement,EmbedData} from './interfaces'

function nextframeId(framesKeys:any) {
  const maxId = framesKeys.reduce((maxId:any, frameKey:any) => Math.max(frameKey, maxId), -1)
  return maxId + 1
}
var defaultSize:Position = {x:600,y:400};

const graphInitialState:State = {
  frames:{
    data:{
      0:{label: 'Example text', embedLink:{type:'image',url:'https://i.imgur.com/JeWDIlv.png',maxSizes:defaultSize}, position:{x:100,y:100},size:{x:0,y:0}},
      1:{label: 'Another example text',embedLink:{type:'image',url:'http://www.google.com/intl/en_ALL/images/logo.gif',maxSizes:defaultSize}, position:{x:200,y:500},size:{x:0,y:0}},
      2:{label: 'Very large multiline example text, hello!',embedLink:null, position:{x:500,y:100},size:{x:0,y:0}}
    },
    keys:[0,1,2]
  },
  links: [
    { frame1: 0, frame2: 1},
    { frame1: 1, frame2: 2},
  ],
  selectedIds: [] as number[],
  editId:null,
}
const frameEditInitialState:any = {
  editId:null,
  dragEffect:{
    isActive:false,
  }
}
// const selectionInitialState:State = {
//   ids: [] as number[]
// }
const overlayEffectsInitialState:any ={
  effects:{
      data:{
        pseudolinkEffect:{
          id:-1,
          isActive:false,
          startPos:{x:0,y:0},
          endPos:{x:0,y:0}
        },
        selectionBoxEffect:{
          isActive:false,
          startPos:{x:0,y:0},
          endPos:{x:0,y:0}
        },
        dragEffect:{
          data:{
            // 0:{
            //   startPos:{x:0,y:0},
            //   endPos:{x:0,y:0}
            // }
          },
            keys:[/*0*/]
        }
      }
  }
}
const overlayEffectsSlice = createSlice({
  name:'overlayEffects',
  initialState:overlayEffectsInitialState,
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
    dragEffectAdded:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data['dragEffect'].data[action.payload.id as number] = {
        startPos:action.payload.startPos,
        endPos:action.payload.endPos
      }
      state.effects!.data['dragEffect'].keys.push(action.payload.id as number);
    },
    dragEffectSetEndPos:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data['dragEffect'].draggedFrames.data[action.payload.id as number].endPos = action.payload.endPos
    },
    dragEffectSetStartPos:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data['dragEffect'].data[action.payload.id as number].endPos = action.payload.endPos
    },
    dragEffectsClear:(state, action:PayloadAction<OverlayEffectPayload>)=>{
      state.effects!.data['dragEffect'].keys.length = 0;
      state.effects!.data['dragEffect'].data = {};
    }
  }
});
function posOp(a:Position,operation:string,b:Position){
  var newPos:Position = {x:0,y:0};
  switch(operation){
    case '+':{
      newPos = {x:a.x+b.x,y:a.y+b.y};
      break;
    }
    case '-':{
      newPos = {x:a.x-b.x,y:a.y-b.y};
    }
  }
  return(newPos);
}
const graphSlice = createSlice({
  name:'frameReducer',
  initialState:graphInitialState,
  reducers:{
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
       maxSizes:defaultSize
      }
    },
    embedRemoved:(state,action:PayloadAction<Payload>)=>{
      state.frames!.data[action.payload.id as number].embedLink = null;
    },

    elementsSelected:(state,action:PayloadAction<Payload>)=>{
      state.selectedIds =state.selectedIds!.concat(action.payload.ids as number[]);
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
    frameAdded:(state, action:PayloadAction<Payload>)=>{
      var nextFrameId:number = nextframeId(state.frames!.keys as number[]);
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
    },
    framesRemoved:(state, action:PayloadAction<Payload>)=>{
      state.links = state.links!.filter(link=>
        !(action.payload.ids!.includes(link.frame1) || action.payload.ids!.includes(link.frame2))
      ); 
      state.frames!.keys = state.frames!.keys.filter((key) => !action.payload.ids!.includes(key));
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
const frameEditSlice = createSlice({
  name:'frameEditSlice',
  initialState:frameEditInitialState,
  reducers:{
    frameSetEdit:(state, action:PayloadAction<Payload>)=>{
      state.editId = action.payload!.id
    }
  }
})
// const selectionSlice = createSlice({
//   name:'selectionReducers',
//   initialState:selectionInitialState,
//   reducers:{
    
//   }
// });
export {graphSlice,frameEditSlice,overlayEffectsSlice};