import {connect, MapStateToPropsParam,ConnectedProps} from 'react-redux'
import {Position,FrameType,FrameElement,EffectType,OverlayEffectTypes,OverlayEffectPayload,EmbedData} from './interfaces'
import {graphSlice,frameEditSlice,overlayEffectsSlice} from './reducers';
import type {RootState,RootDispatch} from './store'


function mapElementEditState(state:RootState){
  return {
    editId: state.frameEditReducer.editId
  }
}
const elementEditStateConnector = connect(mapElementEditState);


const mapElementEditDispatch=(dispatch:RootDispatch)=>({
  frameSetEdit:(id:number|null)=>{dispatch(frameEditSlice.actions.frameSetEdit({id:id}))}
})
const elementEditDispatchConnector = connect(null,mapElementEditDispatch);


function mapElementsState(state:RootState){
  return {
      framesData: state.graphReducer.frames!.data,
      framesKeys: state.graphReducer.frames!.keys,

      links: state.graphReducer.links,

      selectedIds: state.graphReducer.selectedIds
  }
}
const elementsStateConnector = connect(mapElementsState);


const mapEmbedDispatch = (dispatch:RootDispatch)=>({ 
    embedSetMaxSizes:(id:number,maxSizes:Position)=>{dispatch(graphSlice.actions.embedSetMaxSizes({id:id,maxSizes:maxSizes}))},
    embedSetMaxSize:(id:number,coordinate:string,maxSize:number)=>{dispatch(graphSlice.actions.embedSetMaxSize({id:id,coordinate:coordinate,maxSize:maxSize}))},
    embedScaleMaxSize:(id:number,coordinate:string,scale:number)=>{dispatch(graphSlice.actions.embedScaleMaxSize({id:id,coordinate:coordinate,scale:scale}))},
    embedAdded:(id:number,type:string,url:string,maxSizes:Position)=>{dispatch(graphSlice.actions.embedAdded({id:id,type:type,url:url,maxSizes:maxSizes}))},
    embedRemoved:(id:number)=>{dispatch(graphSlice.actions.embedRemoved({id:id}))},
});
const embedDispatchConnector = connect(null,mapEmbedDispatch);


const mapFramesDispatch = (dispatch:RootDispatch)=>({ 
  frameSetSize:(id:number,size:Position)=>{dispatch(graphSlice.actions.frameSetSize({id:id,size:size}))},
  frameAdded:(label:string,embedLink:EmbedData|null,position:Position,size?:Position)=>{dispatch(graphSlice.actions.frameAdded({label:label,embedLink:embedLink,position:position,size:size}))},
  framesRemoved:(ids:number[])=>{dispatch(graphSlice.actions.framesRemoved({ids:ids}))},
  frameRelabelled:(id:number,label:string)=>{dispatch(graphSlice.actions.frameRelabelled({id:id,label:label}))},
  frameMoved:(id:number,position:Position)=>{dispatch(graphSlice.actions.frameMoved({id:id,position:position}))},
});
const framesDispatchConnector = connect(null,mapFramesDispatch);


const mapLinksDispatch = (dispatch:RootDispatch)=>({ 
  linkAdded:(frame1:number,frame2:number)=>{dispatch(graphSlice.actions.linkAdded({link:{frame1,frame2}}))},
  linkRemoved:(id1:number,id2:number)=>{dispatch(graphSlice.actions.linkRemoved({id1:id1,id2:id2}))},
});
const linksDispatchConnector = connect(null,mapLinksDispatch);


const mapSelectionDispatch = (dispatch:RootDispatch)=>({ 
  elementsSelected:(ids:number[])=>{dispatch(graphSlice.actions.elementsSelected({ids:ids}))},
  elementsDeselected:(ids:number[])=>{dispatch(graphSlice.actions.elementsDeselected({ids:ids}))},
  elementsSetSelection:(ids:number[])=>{dispatch(graphSlice.actions.elementsSetSelection({ids:ids}))}
});
const selectionDispatchConnector = connect(null,mapSelectionDispatch);


function mapEffectsPseudolink(state:RootState){
  return{
    effectsDataPseudolink: state.overlayEffectsReducer.effects.data.pseudolinkEffect
  }
}
const pseudolinkEffectConnector = connect(mapEffectsPseudolink);


function mapEffectsSelectionBox(state:RootState){
  return{
    effectsDataSelectionBox: state.overlayEffectsReducer.effects.data.selectionBoxEffect
  }
}
const selectionBoxEffectConnector = connect(mapEffectsSelectionBox);

function mapEffectsDrag(state:RootState){
  return{
    effectsDataDrag: state.overlayEffectsReducer.effects.data.dragEffect
  }
}
const dragEffectConnector = connect(mapEffectsDrag);

function mapEffectsAll(state:RootState){
  return{
    effectsDataAll: state.overlayEffectsReducer.effects.data
  }
}
const allEffectsConnector = connect(mapEffectsAll);

const mapEffectsDispatch = (dispatch:RootDispatch) =>({
    effectSetStart:(type:OverlayEffectTypes['types'],startPos:Position)=>{dispatch(overlayEffectsSlice.actions.effectSetStart({type:type,startPos:startPos}))},
    effectSetEnd:(type:OverlayEffectTypes['types'],endPos:Position)=>{dispatch(overlayEffectsSlice.actions.effectSetEnd({type:type,endPos:endPos}))},
    effectSetActive:(type:OverlayEffectTypes['types'],isActive:boolean)=>{dispatch(overlayEffectsSlice.actions.effectSetActive({type:type,isActive:isActive}))},
    effectSetId:(type:OverlayEffectTypes['types'],id:number)=>{dispatch(overlayEffectsSlice.actions.effectSetId({type:type,id:id}))},
    disableAllEffects:()=>{dispatch(overlayEffectsSlice.actions.disableAllEffects({}))},
  
    dragEffectAdded:(id:number,startPos:Position,endPos:Position)=>{dispatch(overlayEffectsSlice.actions.dragEffectAdded({id:id,startPos:startPos,endPos:endPos}))},
    dragEffectSetEndPos:(id:number,endPos:Position)=>{dispatch(overlayEffectsSlice.actions.dragEffectSetEndPos({id:id,endPos:endPos}))},
    dragEffectSetStartPos:(id:number,startPos:Position)=>{dispatch(overlayEffectsSlice.actions.dragEffectSetStartPos({id:id,endPos:startPos}))},
    dragEffectsClear:()=>{dispatch(overlayEffectsSlice.actions.dragEffectsClear({}))}
});
const effectsDispatchConnector = connect(null,mapEffectsDispatch);


function applyConnectors(component: any & React.Component,connectors:any[]){
  var newComponent = component;
  connectors.forEach((connector)=>{
    newComponent = connector(newComponent);
  })
  return newComponent;
}

export {elementEditStateConnector,elementsStateConnector,

        elementEditDispatchConnector,embedDispatchConnector,framesDispatchConnector,linksDispatchConnector,selectionDispatchConnector,
        
        pseudolinkEffectConnector,selectionBoxEffectConnector,dragEffectConnector,
        allEffectsConnector,effectsDispatchConnector,
      
        applyConnectors};