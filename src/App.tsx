import React, { DetailedHTMLProps } from 'react';
import logo from './logo.svg';
import './App.scss';
import {Button} from 'react-bootstrap';
import '../node_modules/bootstrap/scss/bootstrap.scss'
import ReactDOM from 'react-dom';
import {useState,useEffect,useRef} from 'react'

import {State,LinkType,Position,Position4,FrameType,FrameElement,EffectType,OverlayEffectTypes,OverlayEffectPayload} from './app/interfaces'
import {connect} from 'react-redux'
import {graphSlice,frameEditSlice,selectionSlice,overlayEffectsSlice} from './app/reducers';
import type {RootState} from './app/store'

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
    frameSetSize:(id:number,size:Position)=>{dispatch(graphSlice.actions.frameSetSize({id:id,size:size}))},
    frameAdded:(label:string,position:Position,size?:Position)=>{dispatch(graphSlice.actions.frameAdded({label:label,position:position,size:size}))},
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
//--- code above used because cleaner code below gives shallow comparison bugs in shouldComponentUpdate due to refs comparison
// function effectMapperSelector(effectNames:string[]|'all'){
//   if(effectNames==='all'){
//     return((state:any)=>{
//       return {
//         effectsData: state.overlayEffectsReducer.effects.data
//       }
//     });
//   } else {
//     return((state:any)=>{
//       var effectMap = new Map<string,OverlayEffectPayload>([]);
//       effectNames.forEach((effectName)=>{
//        effectMap.set(effectName,state.overlayEffectsReducer.effects.data[effectName]);
//       });
//       return {
//         effectsData: Object.fromEntries(effectMap)
//       }
//     });
//   }
// }
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

class Frame extends React.Component</*{id:Readonly<number>,text:string,position:Position,size:Position,frameH:number,frameW:number,radius:number,
                                    isSelected:boolean, zIndex:number,
                                      initCallback:any,
                                      dragCallback:any,
                                      selectionCallback:any,
                                      deselectionCallback:any,
                                      deleteCallback:any,
                                      createLinkCallback:any,

                                      effectSetStart:any,
                                      effectSetEnd:any,
                                      effectSetActive:any,
                                      effectSetId:any,

                                      dragEffectAdded:any,
                                      dragEffectSetStartPos:any,
                                      dragEffectsClear:any,
                                      dragEffectSetEndPos:any,
                                      effects:any,

                                      relabelCallback:any,

                                      editId:any,
                                      frameSetEdit:any
                                    },
                                    {
                                    }*/any>{
 wrapRef = React.createRef<any>();
 handleRef = React.createRef<any>();
 contentRef = React.createRef<any>();
 relabelRef = React.createRef<any>();
 constructor(props:any){
  super(props);
 }
 resize(){
  var size = {x:(this.wrapRef.current as any)!.clientWidth,y:(this.wrapRef.current as any)!.clientHeight};
  this.props.initCallback(this.props.id,size);
 }
 shouldComponentUpdate(nextProps:any,nextState:any){
  if(nextProps.editId!=this.props.id && this.props.editId==this.props.id){
    if(this.relabelRef.current.value.length!=0){
      this.props.relabelCallback(this.props.id,this.relabelRef.current.value);
    }
    this.resize();
  }
  if(nextProps.editId==this.props.id && this.props.editId!=this.props.id){
    this.resize();
  }
  if(nextProps!=undefined){
    if(nextProps.size.y!=(this.wrapRef.current as any)!.clientHeight){
      this.resize();
    }
  }
  return(true);
  }
 componentDidMount(){
    //handle box binding
    // (this.handleRef.current)!.addEventListener('mouseup', this.handleHandlers.onMouseUp);
    (this.handleRef.current)!.addEventListener('mousedown', this.handleHandlers.onMouseDown);

    //content box binding
    (this.contentRef.current)!.addEventListener('mouseup', this.contentHandlers.onMouseUpElement);
    (this.contentRef.current)!.addEventListener('mousedown', this.contentHandlers.onMouseDown);

    //wrap box binding
    (this.wrapRef.current)!.addEventListener('dblclick', this.wrapHandlers.onDoubleClick);

    this.resize();
 }
 componentWillUnmount(){
  //handle box unbinding
  // (this.handleRef.current)!.removeEventListener('mouseup', this.handleHandlers.onMouseUp);
  (this.handleRef.current)!.removeEventListener('mousedown', this.handleHandlers.onMouseDown);

  //content box unbinding
  (this.contentRef.current)!.removeEventListener('mouseup', this.contentHandlers.onMouseUpElement);
  (this.contentRef.current)!.removeEventListener('mousedown', this.contentHandlers.onMouseDown);

  //wrap box unbinding
  (this.wrapRef.current)!.removeEventListener('dblclick', this.wrapHandlers.onDoubleClick);

 }
 handleHandlers = {
  onMouseDown:(e:MouseEvent)=>{
    if (e.button !== 0) return
    this.props.dragCallback(this.props.id,e.pageX,e.pageY);
  //   this.props.dragEffectAdded(0,
  //                 {x:e.pageX-this.props.position.x,y:e.pageY-this.props.position.y}, 
  //                 {x:e.pageX,y:e.pageY});
  //   this.props.effectSetActive('dragEffect',true); 
  // },

  // onMouseUp:(e:MouseEvent)=>{
  //  this.props.effectSetActive('dragEffect',false);
  //  this.props.dragEffectsClear();
  }
 }
 contentHandlers = {
  onMouseDown:(e:MouseEvent)=>{
    if (e.button !== 0) return
    this.props.effectSetStart('pseudolinkEffect',{x: e.pageX,
      y: e.pageY});
    this.props.effectSetEnd('pseudolinkEffect',{x: e.pageX,
      y: e.pageY});
    this.props.effectSetId('pseudolinkEffect',this.props.id);
    this.props.effectSetActive('pseudolinkEffect',true); //todo: 4 actions -> 1 action
  
  },
  onMouseUpElement:(e:MouseEvent)=>{
    if (e.button !== 0) return;
    if(this.props.effectsDataPseudolink.isActive) this.props.createLinkCallback(this.props.id);
  }
 }
 wrapHandlers = {
    onDoubleClick:(e:MouseEvent)=>{
      if(this.props.editId==null){
        this.props.frameSetEdit(this.props.id);              
      }
    }
 }
 renderText(){
  if(this.props.editId===this.props.id){
    return(<textarea style={{boxSizing:'border-box',width:'100%'}} rows={5} ref={this.relabelRef} defaultValue={this.props.text}/>)
  } else {
    return(this.props.text)
  }
 }
 render(){
  var pseudolink:JSX.Element = 
    <line x1={this.props.position.x+this.props.size.x/2} y1={this.props.position.y+this.props.size.y/2} 
          x2={this.props.effectsDataPseudolink.endPos!.x} y2={this.props.effectsDataPseudolink.endPos!.y} 
          id = 'svg-line'
    />
    return(
      <div style={{zIndex:this.props.zIndex}}>
        <div className={this.props.isSelected ? 'frame wrap active' : 'frame wrap'} 
          style={{
              left:this.props.position.x,
              top:this.props.position.y
           }} 
          ref={this.wrapRef}>
              <div className='frame handle' ref={this.handleRef}></div>
              <div className='frame text' ref={this.contentRef}>
                  {this.renderText()}
              </div>
      </div>
      <svg style={{position:'absolute',overflow:'visible'}}>
          {this.props.effectsDataPseudolink.isActive&&(this.props.effectsDataPseudolink.id==this.props.id)&&pseudolink}
      </svg>
     </div>
    );
 }
}
const Frame_w1 = connect(mapEffectsPseudolink, mapEffectsDispatch)(Frame);
const Frame_w2 = connect(mapEffectsSelectionBox, mapEffectsDispatch)(Frame_w1);
const Frame_w = connect(mapElementEditState, mapElementEditDispatch)(Frame_w2);

class Line extends React.Component<{x1:number,y1:number,x2:number,y2:number,deleteCallback:any,id1:number,id2:number},{}>{
  ref = React.createRef<any>();

  onDoubleClick=(e:MouseEvent)=>{
    this.props.deleteCallback(this.props.id1,this.props.id2);
  }
  componentDidMount(){
    (this.ref.current as HTMLElement)!.addEventListener('dblclick',this.onDoubleClick);
  }
  componentWillUnmount(){
    (this.ref.current as HTMLElement)!.removeEventListener('dblclick',this.onDoubleClick);
  }
  render(){
    return(
      <line x1={this.props.x1} y1={this.props.y1} x2={this.props.x2} y2={this.props.y2} ref={this.ref}
      className='line'>
      </line>
    );
  }
}

class Link extends React.Component<{x1:number,y1:number,x2:number,y2:number,deleteCallback:any,id1:number,id2:number,zIndex:number},{offset:Position4}>{
  ref = React.createRef<HTMLInputElement>();
  constructor(props:any){
    super(props);
  }
  componentDidUpdate(prevProps:any){
    if(prevProps!==this.props){
    }
  }
  render(){
    return(
      <svg style={{position:'absolute',overflow:'visible',pointerEvents:'none',zIndex:this.props.zIndex}}>
        <Line x1={this.props.x1} y1={this.props.y1} x2={this.props.x2} y2={this.props.y2} 
          deleteCallback={this.props.deleteCallback} id1={this.props.id1} id2={this.props.id2}/>
      </svg>
    );
  }
}

class Clickbox extends React.Component</*{zIndex:number,
                                        disableAllEffects:any,
                                        effectSetStart:any,
                                        effectSetEnd:any,
                                        effectSetActive:any,
                                        effectSetId:any,
                                        dragEffectsClear:any,
                                        effectsDataSelectionBox:any,
                                      
                                        areaSelectionCallback:any,
                                        areaDeselectionCallback:any}*/any>{
  selectionBoxRef = React.createRef<HTMLDivElement>();
  clickboxRef = React.createRef<HTMLDivElement>();
  constructor(props:any){
    super(props);
  }
  clickboxHandlers={
    onMouseDown:(e:MouseEvent)=>{
      if (e.button !== 0) return
      if(this.props.editId!==null){
        this.props.frameSetEdit(null);
      } else {
        this.props.effectSetStart('selectionBoxEffect',{x: e.pageX,
          y: e.pageY});
        this.props.effectSetEnd('selectionBoxEffect',{x: e.pageX,
          y: e.pageY});
        this.props.effectSetActive('selectionBoxEffect',true);
      }
       //todo: 4 actions -> 1 action
    },
    onMouseUp:(e:MouseEvent)=>{
      if(this.props.effectsDataSelectionBox.isActive){ //todo: unlink effects isActive from positions to fix redundant clickbox redraw
        this.props.areaSelectionCallback(this.props.effectsDataSelectionBox.startPos,this.props.effectsDataSelectionBox.endPos);
      }
      this.props.disableAllEffects();
      this.props.dragEffectsClear();
    }
   }
   componentDidMount(){
    (this.clickboxRef.current)!.addEventListener('mousedown', this.clickboxHandlers.onMouseDown);
    document.addEventListener('mouseup', this.clickboxHandlers.onMouseUp);
  }
  componentWillUnmount(){
    (this.clickboxRef.current)!.removeEventListener('mousedown', this.clickboxHandlers.onMouseDown);
    document.removeEventListener('mouseup', this.clickboxHandlers.onMouseUp);
  }
  render(){
    return(
      <div ref={this.clickboxRef} style={{zIndex:this.props.zIndex,height:'100vh',width:'100vw',position:'absolute'}}>

      </div>
    );
  }
}
const Clickbox_w1 = connect(mapEffectsSelectionBox, mapEffectsDispatch)(Clickbox);
const Clickbox_w = connect(mapElementEditState, mapElementEditDispatch)(Clickbox_w1);

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
function posShift(obj:FrameElement,shift:Position){
  return({...obj,
    position: posOp(obj.position,'+',shift)
  });
}
class Tracker extends React.Component<any>{
  constructor(props:any){
    super(props);
  }
  onMouseMove=(e:MouseEvent)=>{
    if(this.props.effectsDataAll['pseudolinkEffect'].isActive){
      this.props.effectSetEnd('pseudolinkEffect',{x: e.pageX,
        y: e.pageY});
    }
    if(this.props.effectsDataAll['selectionBoxEffect'].isActive){
      this.props.effectSetEnd('selectionBoxEffect',{x: e.pageX,
        y: e.pageY});
    }
    if(this.props.effectsDataAll['dragEffect'].isActive){
      this.props.effectsDataAll['dragEffect'].keys.forEach((keyId:number)=>{
        this.props.frameMoved(keyId,posOp({x:e.pageX,y:e.pageY},'-',this.props.effectsDataAll.dragEffect.data[keyId].startPos));
      });
    }
  }
  componentDidMount(){
    document.addEventListener('mousemove',this.onMouseMove);
  }
  componentWillUnmount(){
    document.removeEventListener('mousemove',this.onMouseMove);
  }
  render(){
    return(false);
  }
}
const Tracker_w = connect(mapEffectsAll, mapEffectsDispatch)(Tracker);

class SelectionBox extends React.Component<any>{
  createSelectionRectangle(startPosition:Position,endPosition:Position){
    return(
      <svg style={{position:'absolute',overflow:'visible'}}>
        <line
          x1={startPosition.x} y1={startPosition.y}
          x2={endPosition.x} y2={startPosition.y}
          id='svg-selectionBox'/>
          <line
          x1={endPosition.x} y1={startPosition.y}
          x2={endPosition.x} y2={endPosition.y}
          id='svg-selectionBox'/>
          <line
          x1={endPosition.x} y1={endPosition.y}
          x2={startPosition.x} y2={endPosition.y}
          id='svg-selectionBox'/>
          <line
          x1={startPosition.x} y1={endPosition.y}
          x2={startPosition.x} y2={startPosition.y}
          id='svg-selectionBox'/>
      </svg>
    );
  }
  render() {
    return(
      <svg style={{position:'absolute',overflow:'visible',pointerEvents:'none',zIndex:this.props.zIndex}}>
            {this.props!.effectsDataSelectionBox!.isActive && 
              this.createSelectionRectangle(this.props!.effectsDataSelectionBox.startPos as Position,
                                       this.props!.effectsDataSelectionBox.endPos as Position
                                       )
            }
          </svg>
    );
  }
}
const SelectionBox_w = connect(mapEffectsSelectionBox, mapEffectsDispatch)(SelectionBox);

class App extends React.Component<any,{frameBuffer:any[]}>{
  frameW = 150;
  frameH = 40;

  constructor(props:any){
    super(props);
    this.state = {frameBuffer:[] as FrameElement[]}
  }

  selectElementsInArea=(startPos:Position,endPos:Position)=>{
    function verticePass(/*startPos:Position,endPos:Position*/ verticePos:Position,shift:Position){
      return (((verticePos.x+shift.x)>startPos.x && (verticePos.x+shift.x)<endPos.x) || ((verticePos.x+shift.x)<startPos.x && (verticePos.x+shift.x)>endPos.x))
      && (((verticePos.y+shift.y)>startPos.y && (verticePos.y+shift.y)<endPos.y)||((verticePos.y+shift.y)<startPos.y && (verticePos.y+shift.y)>endPos.y))
    }
    var arr = this.props.framesKeys.filter((id:number) => {
      var frame = this.props.framesData[id];
      return(verticePass(frame.position,{x:0,y:0})
        ||verticePass(frame.position,{x:frame.size.x,y:0})
        ||verticePass(frame.position,{x:frame.size.x,y:frame.size.y})
        ||verticePass(frame.position,{x:0,y:frame.size.y})
      )
    })
    this.props.elementsDeselected([]);
    this.props.elementsSelected(arr);
  }
  jointDecorator(x1:number,y1:number,x2:number,y2:number,frameW1:number,frameH1:number,frameW2:number,frameH2:number){
    x1+=frameW1/2;
    y1+=frameH1/2;
    x2+=frameW2/2;
    y2+=frameH2/2;
    return {x1,y1,x2,y2}
  }
  renderLinksFromProps(zIndex:number){
    var links = this.props.links.map((link:LinkType) =>{
      var positions = this.jointDecorator(
        this.props.framesData[link.frame1].position.x,
        this.props.framesData[link.frame1].position.y,
        this.props.framesData[link.frame2].position.x,
        this.props.framesData[link.frame2].position.y,

        this.props.framesData[link.frame1].size.x,
        this.props.framesData[link.frame1].size.y,
        this.props.framesData[link.frame2].size.x,
        this.props.framesData[link.frame2].size.y,
      );
      return(
      <Link 
          id1={link.frame1}
          id2={link.frame2}
          x1={positions.x1}
          y1={positions.y1}
          x2={positions.x2}
          y2={positions.y2}
          zIndex={zIndex}
          deleteCallback={this.props.linkRemoved}
      />);
    });
    return(links);
  }
   globalHandlers={
    onCombinationPressed:(evt: KeyboardEvent)=>{
      evt = evt||window.event // IE support
      var c = evt.keyCode
      var ctrlDown = evt.ctrlKey||evt.metaKey // Mac support
  
      // Check for Alt+Gr (http://en.wikipedia.org/wiki/AltGr_key)
      if (ctrlDown && evt.altKey) {console.log('altgr')}
  
      // Check for ctrl+c, v and x
      else if (ctrlDown && c==67) {
        if(this.props.ids.length>0){
          var frameArr:any[] = [];
          var oldFrameIds:number[] = [];
          this.props.ids.forEach((id:number)=>{
            frameArr.push(posShift(this.props.framesData[id],{x:20,y:20}));
          });
          this.setState({frameBuffer:frameArr});
        }
      } // c
      else if (ctrlDown && c==86) {
          this.state.frameBuffer.forEach((frameObject:any)=>{
            this.props.frameAdded(frameObject.label,frameObject.position,frameObject.size);
          });
      } // v
      else if (ctrlDown && c==88) {
        if(this.props.ids.length>0){
          var frameArr:any[] = [];
          var oldFrameIds:number[] = [];
          this.props.ids.forEach((id:number)=>{
            frameArr.push(this.props.framesData[id]);
            oldFrameIds.push(id);
          });
          this.setState({frameBuffer:frameArr});
          this.props.elementsDeselected(this.props.ids);
            this.props.framesRemoved(oldFrameIds);
        }
      } // x
    },
    onKeyDown:(e:KeyboardEvent)=>{
      if(e.key == 'Delete'){
        var idsToDelete = [] as number[];
        this.props.ids!.forEach((selectedId:number)=>idsToDelete.push(selectedId));
        this.props.framesRemoved(idsToDelete);
      }
      if(e.key == 'Escape'){
        if(this.props.ids.length!==0){
          this.props.elementsDeselected([]);
        }
        if(this.props.editId!==null){
          this.props.frameSetEdit(null);
        }
      }
      this.globalHandlers.onCombinationPressed(e);
    }
   }
  componentDidMount(){
    document.addEventListener('keydown',this.globalHandlers.onKeyDown);
  }
  componentWillUnmount(){
    document.addEventListener('keydown',this.globalHandlers.onKeyDown);
  }
  createLinkCallback=(fromId:number)=>{
    this.props.linkAdded(fromId,this.props.effectsDataPseudolink.id);
  }
  selectionCallback=(ids:number[])=>{
    this.props.elementsSelected(ids);
  }
  deselectionCallback=(ids:number[])=>{
    this.props.elementsDeselected(ids);
  }
  dragCallback=(fromId:number,eventX:number,eventY:number)=>{
    if(this.props.ids.includes(fromId)){
      this.props.ids.forEach((selectedId:number)=>{//bad naming
        this.props.dragEffectAdded(selectedId,
                  {x:eventX-this.props.framesData[selectedId].position.x,y:eventY-this.props.framesData[selectedId].position.y}, 
                  {x:eventX,y:eventY});
        });
    } else {
      this.props.dragEffectAdded(fromId,
        {x:eventX-this.props.framesData[fromId].position.x,y:eventY-this.props.framesData[fromId].position.y}, 
        {x:eventX,y:eventY});
    }
    this.props.effectSetActive('dragEffect',true); 
  }
  renderFramesFromProps(zIndex:number):JSX.Element[]{
    var arr = this.props.framesKeys.map((id:number) =>{
      var isSelected = false;
      if(this.props.ids.includes(id)){
        isSelected = true;
      }
      return(
        <Frame_w id={id} text={this.props.framesData[id].label} 
                       position={this.props.framesData[id].position} 
                       size={this.props.framesData[id].size} 
                       zIndex={zIndex}
                       frameH={this.frameH} 
                       frameW={this.frameW} 
                       radius={24} 
               isSelected={isSelected}
               initCallback={this.props.frameSetSize} 
               dragCallback={this.dragCallback}
               deleteCallback={this.props.frameRemoved}
               selectionCallback={this.selectionCallback}
               deselectionCallback={this.deselectionCallback}
               createLinkCallback={this.createLinkCallback}

               relabelCallback={this.props.frameRelabelled}
               />
      );
    });
    return(arr);
  }

  render(){
    return(
      <div>
        <Tracker_w frameMoved={this.props.frameMoved}/>
        <Clickbox_w zIndex={1} areaSelectionCallback={this.selectElementsInArea.bind(this)}
                               areaDeselectionCallback={this.props.elementsDeselected}/>
        <Button style={{zIndex:99999,position:'absolute'}} onClick={()=>{this.props.frameAdded('Write something here!',{x:500,y:500})}}>Add</Button>
        {this.renderFramesFromProps(2)}
        {this.renderLinksFromProps(2)}
        <SelectionBox_w zIndex={999}/>
      </div>
    );
  };
}
const App_w1 = connect(mapElementsState, mapElementsDispatch)(App);
const App_w2 = connect(mapEffectsPseudolink, mapEffectsDispatch)(App_w1);
const App_w = connect(mapElementEditState, mapElementEditDispatch)(App_w2);

export default App_w;
