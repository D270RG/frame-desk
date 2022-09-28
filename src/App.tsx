import React from 'react';
import logo from './logo.svg';
import './App.scss';
import {Button} from 'react-bootstrap';
import '../node_modules/bootstrap/scss/bootstrap.scss'
import ReactDOM from 'react-dom';
import {useState,useEffect,useRef} from 'react'

import {State,LinkType,Position,Position4,FrameType,EffectType,OverlayEffectTypes} from './app/interfaces'
import {connect} from 'react-redux'
import {graphSlice,selectionSlice,overlayEffectsSlice} from './app/reducers';
import type {RootState} from './app/store'
function mapState(state:RootState){
  return {
    framesData: state.graphReducer.frames!.data,
    framesKeys: state.graphReducer.frames!.keys,

    links: state.graphReducer.links,

    ids: state.selectionReducer.ids,

    effects: state.overlayEffectsReducer.effects
  }
}
const mapDispatch = (dispatch:any)=>({ 
  frameSetSize:(id:number,size:Position)=>{dispatch(graphSlice.actions.frameSetSize({id:id,size:size}))},
  frameAdded:(label:string,position:Position)=>{dispatch(graphSlice.actions.frameAdded({label:label,position:position}))},
  framesRemoved:(ids:number[])=>{dispatch(graphSlice.actions.framesRemoved({ids:ids}))},
  // frameRelabelled:(id:number,label:string)=>{dispatch(graphSlice.actions.frameRelabelled({id:id,label:label}))},
  frameMoved:(id:number,position:Position)=>{dispatch(graphSlice.actions.frameMoved({id:id,position:position}))},
  // frameMovedRel:(id:number,position:Position)=>{dispatch(graphSlice.actions.frameMovedRel({id:id,position:position}))},

  linkAdded:(frame1:number,frame2:number)=>{dispatch(graphSlice.actions.linkAdded({link:{frame1,frame2}}))},
  linkRemoved:(id1:number,id2:number)=>{dispatch(graphSlice.actions.linkRemoved({id1:id1,id2:id2}))},

  elementsSelected:(selectedIds:number[])=>{dispatch(selectionSlice.actions.elementsSelected({selectedIds:selectedIds}))},
  elementsDeselected:(selectedIds:number[])=>{dispatch(selectionSlice.actions.elementsDeselected({selectedIds:selectedIds}))},

  effectSetStart:(type:OverlayEffectTypes['types'],startPos:Position)=>{dispatch(overlayEffectsSlice.actions.effectSetStart({type:type,startPos:startPos}))},
  effectSetEnd:(type:OverlayEffectTypes['types'],endPos:Position)=>{dispatch(overlayEffectsSlice.actions.effectSetEnd({type:type,endPos:endPos}))},
  effectSetActive:(type:OverlayEffectTypes['types'],isActive:boolean)=>{dispatch(overlayEffectsSlice.actions.effectSetActive({type:type,isActive:isActive}))},
  effectSetId:(type:OverlayEffectTypes['types'],id:number)=>{dispatch(overlayEffectsSlice.actions.effectSetId({type:type,id:id}))},
  disableAllEffects:()=>{dispatch(overlayEffectsSlice.actions.disableAllEffects({}))},
  //todo:separate slice
  dragEffectAdded:(id:number,startPos:Position,endPos:Position)=>{dispatch(overlayEffectsSlice.actions.dragEffectAdded({id:id,startPos:startPos,endPos:endPos}))},
  dragEffectSetEndPos:(id:number,endPos:Position)=>{dispatch(overlayEffectsSlice.actions.dragEffectSetEndPos({id:id,endPos:endPos}))},
  dragEffectSetStartPos:(id:number,startPos:Position)=>{dispatch(overlayEffectsSlice.actions.dragEffectSetStartPos({id:id,endPos:startPos}))},
  dragEffectsClear:()=>{dispatch(overlayEffectsSlice.actions.dragEffectsClear({}))}
});

class Frame extends React.Component<{id:Readonly<number>,text:string,position:Position,size:Position,frameH:number,frameW:number,radius:number,
                                    isSelected:boolean, zIndex:number, effects:EffectType,
                                      initCallback:any,
                                      dragCallback:any,
                                      selectionCallback:any,
                                      deselectionCallback:any,
                                      deleteCallback:any,
                                      createLinkCallback:any
                                      
                                      effectStartCallback:any,
                                      effectEndCallback:any,
                                      effectSetActiveCallback:any,
                                      effectSetIdCallback:any,
                                      
                                      dragEffectAddedCallback:any,
                                      dragEffectStartCallback:any,
                                      dragEffectEndCallback:any,
                                      dragEffectsClear:any
                                    },
                                    {}>{
 wrapRef = React.createRef<any>();
 handleRef = React.createRef<any>();
 contentRef = React.createRef<any>();
 constructor(props:any){
  super(props);
 }
 componentDidMount(){
    //handle box binding
    // document.addEventListener('mouseup', this.handleHandlers.onMouseUp);
    (this.handleRef.current)!.addEventListener('mouseup', this.handleHandlers.onMouseUp);
    (this.handleRef.current)!.addEventListener('mousedown', this.handleHandlers.onMouseDown);

    //content box binding
    // document.addEventListener('mouseup', this.contentHandlers.onMouseUpDocument);
    (this.contentRef.current)!.addEventListener('mouseup', this.contentHandlers.onMouseUpElement);
    (this.contentRef.current)!.addEventListener('mousedown', this.contentHandlers.onMouseDown);

    //wrap box binding
    (this.wrapRef.current)!.addEventListener('dblclick', this.wrapHandlers.onDoubleClick);


    var size = {x:(this.wrapRef.current as any)!.clientWidth,y:(this.wrapRef.current as any)!.clientHeight};
    this.props.initCallback(this.props.id,size);
 }
 componentWillUnmount(){
  //handle box unbinding
  (this.handleRef.current)!.removeEventListener('mouseup', this.handleHandlers.onMouseUp);
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
    this.props.dragEffectAddedCallback(this.props.id,
                  {x:e.pageX-this.props.position.x,y:e.pageY-this.props.position.y}, //start
                  {x:e.pageX,y:e.pageY}); //end
    this.props.effectSetActiveCallback('dragEffect',true); //todo: 4 actions -> 1 action
  },
  onMouseUp:(e:MouseEvent)=>{
    this.props.effectSetActiveCallback('dragEffect',false);
    this.props.dragEffectsClear();
  }
 }
 contentHandlers = {
  onMouseDown:(e:MouseEvent)=>{
    if (e.button !== 0) return
    this.props.effectStartCallback('pseudolinkEffect',{x: e.pageX,
      y: e.pageY});
    this.props.effectEndCallback('pseudolinkEffect',{x: e.pageX,
      y: e.pageY});
    this.props.effectSetIdCallback('pseudolinkEffect',this.props.id);
    this.props.effectSetActiveCallback('pseudolinkEffect',true); //todo: 4 actions -> 1 action
  
  },
  onMouseUpElement:(e:MouseEvent)=>{
    if (e.button !== 0) return;
    this.props.effectSetActiveCallback('pseudolinkEffect',false);
    this.props.createLinkCallback(this.props.id);
  }
 }
 wrapHandlers = {
    onDoubleClick:(e:MouseEvent)=>{
      if(this.props.isSelected){
        this.props.deselectionCallback([]);
      } else {
        this.props.deselectionCallback([]);
        this.props.selectionCallback([this.props.id]);
      }
      e.stopPropagation()
      e.preventDefault()
    }
 }


 render(){
  var pseudolink:JSX.Element = 
    <line x1={this.props.position.x+this.props.size.x/2} y1={this.props.position.y+this.props.size.y/2} 
          x2={this.props.effects.data['pseudolinkEffect'].endPos!.x} y2={this.props.effects.data['pseudolinkEffect'].endPos!.y} style={{
          stroke:'red',
          strokeWidth:1,
          cursor:'pointer',
          zIndex:1
    }}/>
  if(this.props.isSelected){
    return(
      <div style={{zIndex:this.props.zIndex}}>
        <div style={{minHeight:this.props.frameH,
          width:this.props.frameW,
          textAlign:'center',
          position:'absolute',
          border:'2px solid',
          color:'red',
          left:this.props.position.x,
          top:this.props.position.y,
          zIndex:'100',
          background:'white',
          alignItems:'center',
          padding:6,
          userSelect:'none'}} ref={this.wrapRef}>
              <div style={{
                width:'100%',
                height:'20px',
                backgroundColor:'black',
                cursor:'pointer'}} ref={this.handleRef}></div>
              <div style={{
                width:'100%'}} ref={this.contentRef}>{this.props.text}</div>
      </div>
      <svg style={{position:'absolute',overflow:'visible'}}>
          {this.props.effects.data['pseudolinkEffect'].isActive&&(this.props.effects.data['pseudolinkEffect'].id==this.props.id)&&pseudolink}
      </svg>
     </div>
    );
  } else {
    return(
      <div style={{zIndex:999}}>
        <div style={{minHeight:this.props.frameH,
          width:this.props.frameW,
          textAlign:'center',
          position:'absolute',
          border:'1px solid',
          color:'black',
          left:this.props.position.x,
          top:this.props.position.y,
          zIndex:'100',
          background:'white',
          alignItems:'center',
          userSelect:'none'}} ref={this.wrapRef}>
              <div style={{
                width:'100%',
                height:'40px',
                backgroundColor:'black',
                cursor:'pointer'}} ref={this.handleRef}></div>
              <div style={{
                width:'100%',padding:6}} ref={this.contentRef}>{this.props.text}</div>
      </div>
      <svg style={{position:'absolute',overflow:'visible'}}>
        {this.props.effects.data['pseudolinkEffect'].isActive&&(this.props.effects.data['pseudolinkEffect'].id==this.props.id)&&pseudolink}
      </svg>
     </div>
    );
  }
  
 }
}


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
      <line x1={this.props.x1} y1={this.props.y1} x2={this.props.x2} y2={this.props.y2} style={{
        stroke:'red',
        strokeWidth:4,
        cursor:'pointer',
        zIndex:1
      }} ref={this.ref}>
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
      <svg style={{position:'absolute',overflow:'visible',zIndex:this.props.zIndex}}>
        <Line x1={this.props.x1} y1={this.props.y1} x2={this.props.x2} y2={this.props.y2} 
          deleteCallback={this.props.deleteCallback} id1={this.props.id1} id2={this.props.id2}/>
      </svg>
    );
  }
}
class Clickbox extends React.Component<{zIndex:number,disableAllEffectsCallback:any,
                                        effectStartCallback:any,
                                        effectEndCallback:any,
                                        effectSetActiveCallback:any,
                                        effectSetIdCallback:any,
                                        dragEffectsClear:any,
                                        effects:EffectType}>{
  selectionBoxRef = React.createRef<HTMLDivElement>();
  clickboxRef = React.createRef<HTMLDivElement>();
  constructor(props:any){
    super(props);
  }
  clickboxHandlers={
    onMouseDown:(e:MouseEvent)=>{
      if (e.button !== 0) return
      this.props.effectStartCallback('selectionBoxEffect',{x: e.pageX,
        y: e.pageY});
      this.props.effectEndCallback('selectionBoxEffect',{x: e.pageX,
        y: e.pageY});
      this.props.effectSetActiveCallback('selectionBoxEffect',true); //todo: 4 actions -> 1 action
    },
    onMouseUp:(e:MouseEvent)=>{
      this.props.disableAllEffectsCallback();
      this.props.dragEffectsClear();
    }
   }
   componentDidMount(){
    (this.clickboxRef.current)!.addEventListener('mousedown', this.clickboxHandlers.onMouseDown);
    (this.clickboxRef.current)!.addEventListener('mouseup', this.clickboxHandlers.onMouseUp);
  }
  componentWillUnmount(){
    (this.clickboxRef.current)!.removeEventListener('mousedown', this.clickboxHandlers.onMouseDown);
    (this.clickboxRef.current)!.removeEventListener('mouseup', this.clickboxHandlers.onMouseUp);
  }
  render(){
    var selectionBox:JSX.Element = <rect></rect>
    //   <rect 
    //     x={this.state.selectionBoxStart.x} 
    //     y={this.state.selectionBoxStart.y} 
    //     width={this.state.selectionBoxStart.x-this.state.selectionBoxEnd.x} 
    //     height={this.state.selectionBoxStart.y-this.state.selectionBoxEnd.y}
    //     style={{          
    //       stroke:'red',
    //       strokeWidth:1
    //     }}>
    // </rect> 
    return(
      <div ref={this.clickboxRef} style={{zIndex:this.props.zIndex,height:'100vh',width:'100vw',position:'absolute'}}>
          <svg style={{position:'absolute',overflow:'visible',zIndex:1}}>
            {/* {this.state.selectionBoxActive && selectionBox} */}
          </svg>
      </div>
    );
  }
}
function posOp(a:Position,operation:string,b:Position){
  var newPos:Position = {x:0,y:0};
  console.log('posOp',a,b);
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
class App extends React.Component<any>{
  frameW = 150;
  frameH = 40;

  constructor(props:any){
    super(props);
  }
   globalHandlers={
    onMouseMove:(e:MouseEvent)=>{
      this.props.effects.keys.forEach((effectKey:OverlayEffectTypes['types'])=>{
        if(this.props.effects.data[effectKey].isActive){
          this.props.effectSetEnd(effectKey,{x: e.pageX,
            y: e.pageY});
        }
      });
      if(this.props.effects.data['dragEffect'].isActive){
        console.log('activedrag');
        this.props.effects.data['dragEffect'].draggedFrames.keys.forEach((keyId:number)=>{
          this.props.frameMoved(keyId,posOp({x:e.pageX,y:e.pageY},'-',this.props.effects.data['dragEffect'].draggedFrames.data[keyId].startPos));
        });
      }

    },
    onKeyDown:(e:KeyboardEvent)=>{
      if(e.key == 'Delete'){
        var idsToDelete = [] as number[];
        this.props.ids!.forEach((selectedId:number)=>idsToDelete.push(selectedId));
        this.props.framesRemoved(idsToDelete);
      }
    }
   }
  componentDidMount(){
    document.addEventListener('keydown',this.globalHandlers.onKeyDown);
    document.addEventListener('mousemove',this.globalHandlers.onMouseMove);
  }
  componentWillUnmount(){
    document.addEventListener('keydown',this.globalHandlers.onKeyDown);
    document.addEventListener('mousemove',this.globalHandlers.onMouseMove);
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
  selectionCallback=(ids:number[])=>{
    this.props.elementsSelected(ids);
  }
  deselectionCallback=(ids:number[])=>{
    this.props.elementsDeselected(ids);
  }
  createLinkCallback=(fromId:number)=>{
      this.props.linkAdded(fromId,this.props.effects.data['pseudolinkEffect'].id);
  }

  renderFramesFromProps(zIndex:number):JSX.Element[]{
    var arr = this.props.framesKeys.map((id:number) =>{
      var isSelected = false;
      if(this.props.ids.includes(id)){
        isSelected = true;
      }
      return(
        <Frame id={id} text={this.props.framesData[id].label} 
                       position={this.props.framesData[id].position} 
                       size={this.props.framesData[id].size} 
                       zIndex={zIndex}
                       frameH={this.frameH} 
                       frameW={this.frameW} 
                       radius={24} 
               isSelected={isSelected}
               initCallback={this.props.frameSetSize} 
               dragCallback={this.props.frameMoved}
               deleteCallback={this.props.frameRemoved}
               selectionCallback={this.selectionCallback}
               deselectionCallback={this.deselectionCallback}
               createLinkCallback={this.createLinkCallback}
               effectStartCallback={this.props.effectSetStart}
               effectEndCallback={this.props.effectSetEnd}
               effectSetActiveCallback={this.props.effectSetActive}
               effectSetIdCallback={this.props.effectSetId}

               dragEffectAddedCallback={this.props.dragEffectAdded}
               dragEffectStartCallback={this.props.dragEffectSetStartPos}
               dragEffectEndCallback={this.props.dragEffectSetEndPos}
               dragEffectsClear={this.props.dragEffectsClear}

               effects={this.props.effects}
               />
      );
    });
    return(arr);
  }
  
  jointDecorator(x1:number,y1:number,x2:number,y2:number,frameW1:number,frameH1:number,frameW2:number,frameH2:number){
    x1+=frameW1/2;
    y1+=frameH1/2;
    x2+=frameW2/2;
    y2+=frameH2/2;
    return {x1,y1,x2,y2}
  }
  render(){
    return(
      <div>
        <Clickbox zIndex={1} 
        disableAllEffectsCallback={this.props.disableAllEffects}
        effectStartCallback={this.props.effectSetStart}
        effectEndCallback={this.props.effectSetEnd}
        effectSetActiveCallback={this.props.effectSetActive}
        effectSetIdCallback={this.props.effectSetId}
        dragEffectsClear={this.props.dragEffectsClear}
        effects={this.props.effects}/>
        <Button style={{zIndex:99999,position:'absolute'}} onClick={()=>{this.props.frameAdded('yoyo',{x:130,y:130})}}>Add shit</Button>
        {this.renderFramesFromProps(2)}
        {this.renderLinksFromProps(2)}
      </div>
    );
  };
}

const App_w = connect(mapState, mapDispatch)(App);
export default App_w;
