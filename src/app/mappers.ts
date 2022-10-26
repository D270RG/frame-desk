import {State,LinkType,Position,Position4,FrameType,FrameElement,EffectType,OverlayEffectTypes,OverlayEffectPayload,EmbedData} from './interfaces'
import {graphSlice,frameEditSlice,selectionSlice,overlayEffectsSlice} from './reducers';
import type {RootState} from './store'
function mapElementEditState(state:any){
    return {
      editId: state.frameEditReducer.editId
    }
  }
  const mapElementEditDispatch=(dispatch:any)=>({
    frameSetEdit:(id:number|null)=>{dispatch(frameEditSlice.actions.frameSetEdit({id:id}))}
  })
  
  function mapElementsState(state:any){
    return {
        framesData: state.graphReducer.frames!.data,
        framesKeys: state.graphReducer.frames!.keys,
  
        links: state.graphReducer.links,
  
        ids: state.selectionReducer.ids,
    }
  }
  const mapElementsDispatch = (dispatch:any)=>({ 
      embedSetMaxSizes:(id:number,maxSizes:Position)=>{dispatch(graphSlice.actions.embedSetMaxSizes({id:id,maxSizes:maxSizes}))},
      embedSetMaxSize:(id:number,coordinate:string,maxSize:number)=>{dispatch(graphSlice.actions.embedSetMaxSize({id:id,coordinate:coordinate,maxSize:maxSize}))},
      embedScaleMaxSize:(id:number,coordinate:string,scale:number)=>{dispatch(graphSlice.actions.embedScaleMaxSize({id:id,coordinate:coordinate,scale:scale}))},
      embedAdded:(id:number,type:string,url:string)=>{dispatch(graphSlice.actions.embedAdded({id:id,type:type,url:url}))},
      embedRemoved:(id:number)=>{dispatch(graphSlice.actions.embedRemoved({id:id}))},

      frameSetSize:(id:number,size:Position)=>{dispatch(graphSlice.actions.frameSetSize({id:id,size:size}))},
      frameAdded:(label:string,embedLink:EmbedData|null,position:Position,size?:Position)=>{dispatch(graphSlice.actions.frameAdded({label:label,embedLink:embedLink,position:position,size:size}))},
      framesRemoved:(ids:number[])=>{dispatch(graphSlice.actions.framesRemoved({ids:ids}))},
      frameRelabelled:(id:number,label:string)=>{dispatch(graphSlice.actions.frameRelabelled({id:id,label:label}))},
      frameMoved:(id:number,position:Position)=>{dispatch(graphSlice.actions.frameMoved({id:id,position:position}))},
  
      linkAdded:(frame1:number,frame2:number)=>{dispatch(graphSlice.actions.linkAdded({link:{frame1,frame2}}))},
      linkRemoved:(id1:number,id2:number)=>{dispatch(graphSlice.actions.linkRemoved({id1:id1,id2:id2}))},
  
      elementsSelected:(selectedIds:number[])=>{dispatch(selectionSlice.actions.elementsSelected({selectedIds:selectedIds}))},
      elementsDeselected:(selectedIds:number[])=>{dispatch(selectionSlice.actions.elementsDeselected({selectedIds:selectedIds}))}
  });
  
  function mapEffectsPseudolink(state:any){
    return{
      effectsDataPseudolink: state.overlayEffectsReducer.effects.data.pseudolinkEffect
    }
  }
  function mapEffectsSelectionBox(state:any){
    return{
      effectsDataSelectionBox: state.overlayEffectsReducer.effects.data.selectionBoxEffect
    }
  }
  function mapEffectsDrag(state:any){
    return{
      effectsDataDrag: state.overlayEffectsReducer.effects.data.dragEffect
    }
  }
  function mapEffectsAll(state:any){
    return{
      effectsDataAll: state.overlayEffectsReducer.effects.data
    }
  }
  const mapEffectsDispatch = (dispatch:any) =>({
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
export {mapElementEditState,mapElementEditDispatch,mapElementsState,mapElementsDispatch,
        mapEffectsPseudolink,mapEffectsSelectionBox,mapEffectsDrag,
        mapEffectsAll,mapEffectsDispatch} 