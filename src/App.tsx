import React, { DetailedHTMLProps, Ref } from 'react';
import logo from './logo.svg';
import './App.scss';
import styles from './App.scss';  

import {Button} from 'react-bootstrap';
import '../node_modules/bootstrap/scss/bootstrap.scss'
import ReactDOM from 'react-dom';
import {useState,useEffect,useRef} from 'react'

import {State,LinkType,Position,Position4,FrameType,FrameElement,EffectType,OverlayEffectTypes,OverlayEffectPayload,EmbedData} from './app/interfaces'
import {connect, MapStateToPropsParam} from 'react-redux'
import {graphSlice,frameEditSlice,overlayEffectsSlice} from './app/reducers';
import type {RootState} from './app/store'
import {mapElementEditState,mapElementEditDispatch,mapElementsState,
  mapEmbedDispatch,mapFramesDispatch,mapLinksDispatch,mapSelectionDispatch,
  mapEffectsAll,mapEffectsDispatch,mapEffectsPseudolink,mapEffectsSelectionBox,mapEffectsDrag} from './app/mappers'
import { isEmptyBindingElement } from 'typescript';

function connector(component:React.ComponentType,stateMappers:MapStateToPropsParam<any,any,any>[],dispatchMappers:((dispatch:any)=>void)[]){
  var componentBuffer:any = component;
  stateMappers.forEach(state=>{
    componentBuffer = connect(state)(componentBuffer);
  });
  dispatchMappers.forEach(dispatch=>{
    componentBuffer = connect(null,dispatch)(componentBuffer);
  });
  return(componentBuffer);
}
class EditBox extends React.Component<any,{relScale:any}>{
  editBoxRef;
  editClickboxRef;
  resizeRef;
  markerRefs:React.RefObject<any>[] = [];
  constructor(props:any){
    super(props);
    this.editBoxRef = React.createRef<any>();
    this.editClickboxRef = React.createRef<any>();
    this.resizeRef = React.createRef<any>();
  }
  handleChange(){
    if(this.props.ratio>=1){
      return((Math.round(this.props.embedContent.maxSizes.x*100/this.props.embedFullSize.x))+'%');
    } else {
      return((Math.round(this.props.embedContent.maxSizes.y*100/this.props.embedFullSize.y))+'%');
    }
  }
  render(){
    return(
      <div>
        <div style={{display:'flex',flexDirection:'row',height:'50px',width:'100%'}}>
        <div style={{height:'50px',width:'100px',backgroundColor:'white'}}>{(Math.round(this.props.embedContent.maxSizes.x*100/this.props.embedFullSize.x))+'%'}</div>
        <Button style={{height:'50px',padding:'15px',margin:'0px'}} 
                onClick={(e)=>{
                  this.props.embedSetMaxSizes(this.props.id,'xy',1.1);        
                }}>+</Button>
        <Button style={{height:'50px',padding:'15px',margin:'0px'}} 
                onClick={(e)=>{
                  this.props.embedSetMaxSizes(this.props.id,'xy',0.9);
                }}>-</Button>
        </div>
          {/* <div className='editBox' style={{position:'absolute',
                      width:imageBoundingBox.right-imageBoundingBox.left,height: editMarkerSize+'px',
                      left:framePadding,
                      top:'calc(100% - '+framePadding+'px - '+this.props.childRef.current.clientHeight+'px',
                      textAlign:'left'
                      }}>

            </div> */}
            {this.props.child}
        </div>
    );
  }
}
const EditBox_w = connect(null,mapEmbedDispatch)(EditBox);


class ControlBox extends React.Component<any>{
  constructor(props:any){
    super(props);
  }
  render(){
    return(
      <div>
        <div style={{display:'flex',flexDirection:'row',height:'50px',width:'100%'}}>
        <Button style={{height:'50px',padding:'15px',margin:'0px'}} 
                onClick={(e)=>{
                  this.props.embedPopupCallback(true,this.props.id);
                }}>Add image</Button>
        </div>
          {/* <div className='editBox' style={{position:'absolute',
                      width:imageBoundingBox.right-imageBoundingBox.left,height: editMarkerSize+'px',
                      left:framePadding,
                      top:'calc(100% - '+framePadding+'px - '+this.props.childRef.current.clientHeight+'px',
                      textAlign:'left'
                      }}>

            </div> */}
            {this.props.child}
        </div>
    );
  }
}
const ControlBox_w = connect(null,mapEmbedDispatch)(ControlBox)

class Frame extends React.Component<any,{embedContent:any,embedFullWidth:number|null,embedFullHeight:number|null,embedRatio:any,deleteTooltipVisible:boolean}>{
 wrapRef = React.createRef<any>();
 handleRef = React.createRef<any>();
 contentRef = React.createRef<any>();
 embedRef = React.createRef<any>();
 relabelRef = React.createRef<any>();
 textRef = React.createRef<any>();
 constructor(props:any){
  super(props);
  this.state = {embedContent:null,embedFullWidth:null,embedFullHeight:null,embedRatio:null,deleteTooltipVisible:false}
 }
 resize(extSize:Position|null){
  if(extSize === null){
    var size = {x:(this.wrapRef.current as any)!.clientWidth,y:(this.wrapRef.current as any)!.clientHeight};
    this.props.frameSetSize(this.props.id,size);
  } else {
    this.props.frameSetSize(this.props.id,extSize);
  }
 }
 shouldComponentUpdate(nextProps:any,nextState:any){
  if(nextProps.editId!=this.props.id && this.props.editId==this.props.id){
    if(this.relabelRef.current.value.length!=0){
      this.props.frameRelabelled(this.props.id,this.relabelRef.current.value);
    }
    this.resize(null);
  }
  if(nextProps.editId==this.props.id && this.props.editId!=this.props.id){
    this.resize(null);
  }
  if(nextProps!=undefined){
    if(nextProps.size.y!=(this.wrapRef.current as any)!.clientHeight){
      this.resize(null);
    }
  }
  if(nextProps.embedLink==null && this.props.embedLink!=null){
    this.resize(null);
  }
  return(true);
  }
  componentDidUpdate(){
    if(this.props.embedLink) {
      this.textRef.current.style.maxWidth = (this.props.embedLink.maxSizes.x+'px');
      
    };
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

    this.resize(null);
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
 loadEmbed(){
    var load = ()=>{
      var img = new Image();
      img.src = this.props.embedLink!.url;
      var ratio = img.width/img.height;
      img.onload = ()=>{
        this.setState({embedRatio:ratio,embedFullWidth:img.width,embedFullHeight:img.height,embedContent:this.props.embedLink});
        if(ratio>=1){ //horizontal orientation
          this.props.embedSetMaxSizes(this.props.id,{x:400,y:400/ratio});
        } else { //vertical orientation
          this.props.embedSetMaxSizes(this.props.id,{x:600*ratio,y:600});
        }
      }
    }
    var deleteEmbed = ()=>{
      this.props.embedRemoved(this.props.id);
      this.setState({embedContent:null,embedFullWidth:null,embedFullHeight:null,embedRatio:null,deleteTooltipVisible:false});
    }
    var onError = ()=>{
      this.props.embedAdded(this.props.id,'image',require('./noimage.png'));
    }
    var onMouseEnterImage = ()=>{
      this.setState({deleteTooltipVisible:true})
    }
    var onMouseLeaveImage = ()=>{
      this.setState({deleteTooltipVisible:false})
    }
    if(this.props.embedLink!=null){
      switch(this.props.embedLink.type as string){
        case 'image':{
          if(this.state.embedContent!=null){
            if(this.props.embedLink.url != this.state.embedContent.url){
              load();
            }
          } else {
            load();
          }
          var padding = parseFloat(styles.framePadding);
          var img = <div onMouseEnter={onMouseEnterImage}
                         onMouseLeave={onMouseLeaveImage}>
                      <img ref={this.embedRef} 
                        draggable='false' 
                        style={{
                                width:this.props.embedLink.maxSizes.x,
                                height:this.props.embedLink.maxSizes.y}} 
                        src={this.props.embedLink.url}
                        onError={onError}>
                      </img>
                      {this.state.deleteTooltipVisible&&
                      <div className='embedDeleteTooltip'
                            style={{position:'absolute',
                                  display:'flex',
                                  flexDirection:'row-reverse',
                                  top:'calc(100% - '+(this.props.embedLink.maxSizes.y+1*padding)+'px)',
                                  left:padding+'px',
                                  height:'60px',
                                  width:'calc(100% - '+2*padding+'px)'}}>
                        <Button style={{height:'100%',width:'10%'}} onClick={deleteEmbed}>Delete</Button>
                      </div>}
                    </div>
          if(this.props.editId===this.props.id){
            return(
              <EditBox_w id={this.props.id} 
                       embedContent={this.props.embedLink} 
                       embedFullSize={{x:this.state.embedFullWidth,y:this.state.embedFullHeight}} 
                       childRef={this.embedRef} 
                       ratio={this.state.embedRatio} 
                       type='image' 
                       child={img}>
              </EditBox_w>);
          } else {
            return(img);
          }
        }
      }
    } else {
      return(
        <ControlBox_w id={this.props.id} 
                    embedPopupCallback={this.props.embedPopupCallback}/>
      );
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
              <div ref={this.contentRef} style={{alignItems:'center',justifyContent:'center',textAlign:'center'}}>
                <div ref={this.textRef} className={this.props.embedLink? 'frame text-embed' : 'frame text'}>
                  {
                    
                    this.renderText()
}
                </div>
                <div className='frame embed'>
                  {this.loadEmbed()}
                </div>
              </div>
      </div>
      <svg style={{position:'absolute',overflow:'visible'}}>
          {this.props.effectsDataPseudolink.isActive&&(this.props.effectsDataPseudolink.id==this.props.id)&&pseudolink}
      </svg>
     </div>
    );
 }
}
const Frame_w = connector(Frame,[mapEffectsPseudolink,mapEffectsSelectionBox,mapElementEditState],
                [mapEffectsDispatch,mapElementEditDispatch,mapEmbedDispatch,mapFramesDispatch,mapLinksDispatch,mapSelectionDispatch]);



class EmbedPopup extends React.Component<any,{value:any}>{
  constructor(props:any){
    super(props);
    this.state = {value:''}
  }
  handleFormChange=(event:any)=>{
    this.setState({value: event.target.value});
  }
  handleFormSubmit=(event:any)=>{
    this.props.embedAdded(this.props.id,'image',this.state.value);
    this.props.embedPopupCallback(false,this.props.id)
    event.preventDefault();
  }
  render(){

    return(
    <div>
      <div className='clickbox' style={{zIndex:999}} onClick={()=>{this.props.embedPopupCallback(false,this.props.id)}}/>
        <div className='embedPopup' style={{zIndex:1000}}>
            <form onSubmit={this.handleFormSubmit}>
              <label htmlFor='url'>Input image url</label>
              <input type = 'text' name="url" onChange={this.handleFormChange}></input>
              <input type='submit' value='Submit'></input>
            </form>
        </div>
    </div>
    );
  }
}
const EmbedPopup_w = connect(null,mapEmbedDispatch)(EmbedPopup);

class Line extends React.Component<any,{}>{
  ref = React.createRef<any>();

  onDoubleClick=(e:MouseEvent)=>{
    this.props.linkRemoved(this.props.id1,this.props.id2);
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
const Line_w = connect(null,mapLinksDispatch)(Line);

class Link extends React.Component<any,{offset:Position4}>{
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
        <Line_w x1={this.props.x1} y1={this.props.y1} x2={this.props.x2} y2={this.props.y2} 
        id1={this.props.id1} id2={this.props.id2}/>
      </svg>
    );
  }
}
const Link_w = connect(null,mapFramesDispatch)(Link);

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
const Clickbox_w = connector(Clickbox,[mapEffectsSelectionBox,mapElementEditState],
                  [mapEffectsDispatch,mapElementEditDispatch]);

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

class App extends React.Component<any,{frameBuffer:any[],popupView:boolean,popupId:number}>{
  frameW = 150;
  frameH = 40;

  constructor(props:any){
    super(props);
    this.state = {frameBuffer:[] as FrameElement[],popupView:false,popupId:0}
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
      <Link_w 
          id1={link.frame1}
          id2={link.frame2}
          x1={positions.x1}
          y1={positions.y1}
          x2={positions.x2}
          y2={positions.y2}
          zIndex={zIndex}
      />);
    });
    return(links);
  }
  copySelected(){
    if(this.props.selectedIds.length>0){
      var frameArr:any[] = [];
      var oldFrameIds:number[] = [];
      this.props.selectedIds.forEach((id:number)=>{
        frameArr.push(posShift(this.props.framesData[id],{x:20,y:20}));
      });
      this.setState({frameBuffer:frameArr});
    }
  }
  pasteSelected(){
    this.props.elementsDeselected([]);
    this.state.frameBuffer.forEach((frameObject:any)=>{
      this.props.frameAdded(frameObject.label,frameObject.embedLink,frameObject.position,frameObject.size);
    });
  }
  cutSelected(){
    if(this.props.selectedIds.length>0){
      var frameArr:any[] = [];
      var oldFrameIds:number[] = [];
      this.props.selectedIds.forEach((id:number)=>{
        frameArr.push(this.props.framesData[id]);
        oldFrameIds.push(id);
      });
      this.setState({frameBuffer:frameArr});
      this.props.elementsDeselected(this.props.selectedIds);
        this.props.framesRemoved(oldFrameIds);
    }
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
        this.copySelected();
      } // c
      else if (ctrlDown && c==86) {
        this.pasteSelected();
      } // v
      else if (ctrlDown && c==88) {
        this.cutSelected();
      } // x
    },
    onKeyDown:(e:KeyboardEvent)=>{
      if(e.key == 'Delete'){
        var idsToDelete = [] as number[];
        this.props.selectedIds!.forEach((selectedId:number)=>idsToDelete.push(selectedId));
        this.props.framesRemoved(idsToDelete);
      }
      if(e.key == 'Escape'){
        if(this.props.selectedIds.length!==0){
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
  dragCallback=(fromId:number,eventX:number,eventY:number)=>{
    if(this.props.selectedIds.includes(fromId)){
      this.props.selectedIds.forEach((selectedId:number)=>{//bad naming
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
  popupCallback=(isVisible:boolean,id:number)=>{
    this.setState({popupView:isVisible,popupId:id});
  }
  renderFramesFromProps(zIndex:number):JSX.Element[]{
    var arr = this.props.framesKeys.map((id:number) =>{
      var isSelected = false;
      if(this.props.selectedIds.includes(id)){
        isSelected = true;
      }
      return(
        <Frame_w id={id} text={this.props.framesData[id].label} 
                         embedLink={this.props.framesData[id].embedLink}
                       position={this.props.framesData[id].position} 
                       size={this.props.framesData[id].size} 
                       zIndex={zIndex}
                       frameH={this.frameH} 
                       frameW={this.frameW} 
                       radius={24} 
               isSelected={isSelected}
               dragCallback={this.dragCallback}
               createLinkCallback={this.createLinkCallback}
               embedPopupCallback={this.popupCallback}
               />
      );
    });
    return(arr);
  }
  render(){
    return(
      <div style={{position:'absolute',overflow:'hidden'}} className='app'>
        {this.state.popupView && <EmbedPopup_w id={this.state.popupId} 
                                               embedPopupCallback={this.popupCallback}/>}
        <Tracker_w frameMoved={this.props.frameMoved}/>
        <Clickbox_w zIndex={1} areaSelectionCallback={this.selectElementsInArea.bind(this)}
                               areaDeselectionCallback={this.props.elementsDeselected}/>
        {this.renderFramesFromProps(2)}
        {this.renderLinksFromProps(2)}
        <SelectionBox_w zIndex={999}/>
      </div>
    );
  };
}
const App_w = connector(App,[mapElementsState,mapEffectsPseudolink,mapElementEditState],
  [mapEmbedDispatch,mapFramesDispatch,mapLinksDispatch,mapSelectionDispatch,mapEffectsDispatch]);

export default App_w;
