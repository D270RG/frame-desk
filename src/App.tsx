import React, {MouseEvent} from 'react';
import './App.scss';
import styles from './App.scss';  
import {connect, MapStateToPropsParam,ConnectedProps} from 'react-redux'
import {zoomSlice,graphSlice,frameEditSlice,overlayEffectsSlice} from './app/reducers';
import {LinkType,Position,FrameType,FrameElement,EffectType,OverlayEffectTypes,OverlayEffectPayload,EmbedData} from './app/interfaces'
import { throttle } from 'throttle-typescript';
import {Popup} from './reusableComponents'
import {ScalableButton,ScalableSvgLine,ScalableDiv,ScalableImg,ScalableTextarea} from './scalableComponents'
import { RootDispatch, RootState } from './app/store';

const _frameMinWidth = parseFloat(styles.frameMinWidth);
const _frameMinHeight = parseFloat(styles.frameMinHeight);
const _framePadding = parseFloat(styles.framePadding);

const _handleHeight = parseFloat(styles.handleHeight);
const _borderRadius = parseFloat(styles.borderRadius);

const _lineStrokeWidth = parseFloat(styles.lineStrokeWidth);
const _fontSize = 20;


function mapControlBoxState(state:RootState){
  return{
    zoomMultiplier: state.zoomReducer.zoomMultiplier
  }
}
var controlBoxConnector = connect(mapControlBoxState);
interface ControlBoxProps extends ConnectedProps<typeof controlBoxConnector>{
  id:number,
  embedPopupCallback: (arg0: boolean, arg1: any) => void,
}
class ControlBox extends React.Component<ControlBoxProps,{}>{
  constructor(props:any){
    super(props);
  }
  render(){
    return(
        <ScalableDiv zoomMultiplier={this.props.zoomMultiplier} 
                     style={{display:'flex',flexDirection:'row',height:'50px',width:'100%'}}>
          <ScalableButton className='holoButton'
                          style={{
                            borderRadius:_borderRadius,
                            fontSize:_fontSize
                          }}
                          zoomMultiplier={this.props.zoomMultiplier}
                          onClick={()=>{this.props.embedPopupCallback(true,this.props.id)}}>
            <i className="bi bi-paperclip"></i>
          </ScalableButton>
        </ScalableDiv>
    );
  }
}
var ControlBox_w = controlBoxConnector(ControlBox);


function mapFrameState(state:RootState){
  return{
    editId: state.frameEditReducer.editId,
    zoomMultiplier: state.zoomReducer.zoomMultiplier
  }
}
const mapFrameDispatch = (dispatch:RootDispatch) =>({
  frameSetSize:(id:number,size:Position)=>{dispatch(graphSlice.actions.frameSetSize({id:id,size:size}))},
  frameRelabelled:(id:number,label:string)=>{dispatch(graphSlice.actions.frameRelabelled({id:id,label:label}))},
  frameSetEdit:(id:number|null)=>{dispatch(frameEditSlice.actions.frameSetEdit({id:id}))},

  effectSetStart:(type:OverlayEffectTypes['types'],startPos:Position)=>{dispatch(overlayEffectsSlice.actions.effectSetStart({type:type,startPos:startPos}))},
  effectSetEnd:(type:OverlayEffectTypes['types'],endPos:Position)=>{dispatch(overlayEffectsSlice.actions.effectSetEnd({type:type,endPos:endPos}))},
  effectSetActive:(type:OverlayEffectTypes['types'],isActive:boolean)=>{dispatch(overlayEffectsSlice.actions.effectSetActive({type:type,isActive:isActive}))},
  effectSetId:(type:OverlayEffectTypes['types'],id:number)=>{dispatch(overlayEffectsSlice.actions.effectSetId({type:type,id:id}))},

  embedScaleMaxSize:(id:number,coordinate:string,scale:number)=>{dispatch(graphSlice.actions.embedScaleMaxSize({id:id,coordinate:coordinate,scale:scale}))},
  embedAdded:(id:number,type:string,url:string,maxSizes:Position)=>{dispatch(graphSlice.actions.embedAdded({id:id,type:type,url:url,maxSizes:maxSizes}))},
  embedRemoved:(id:number)=>{dispatch(graphSlice.actions.embedRemoved({id:id}))}
});

var frameConnector = connect(mapFrameState,mapFrameDispatch);
interface FrameProps extends ConnectedProps<typeof frameConnector>

                            //  ConnectedProps<typeof effectsDispatchConnector>,
                            //  ConnectedProps<typeof elementEditDispatchConnector>,
                            //  ConnectedProps<typeof embedDispatchConnector>,
                            //  ConnectedProps<typeof framesDispatchConnector>,
                            //  ConnectedProps<typeof linksDispatchConnector>,
                            //  ConnectedProps<typeof selectionDispatchConnector>
{                   
  id:number,
  text:string,
  embedLink:EmbedData,
  position:Position,
  size:Position,
  zIndex:number,
  frameH:number,
  frameW:number,
  isSelected:boolean,
  dragCallback:(fromId: number, eventX: number, eventY: number) => void,
  createLinkCallback:(fromId: number) => void,
  popupCallback:(isVisible: boolean, id: number) => void,
  pseudolinkCallback:(id:number,eventPos:Position,state:boolean)=>void
}

class Frame extends React.Component<FrameProps,{maxTextWidth:number}>{
 wrapRef = React.createRef<any>();
 handleRef = React.createRef<any>();
 contentRef = React.createRef<any>();
 embedRef = React.createRef<any>();
 relabelRef = React.createRef<any>();
 textRef = React.createRef<any>();
 constructor(props:any){
  super(props);
  this.state = {maxTextWidth:this.props.frameW}
 }
 resize(extSize:Position|null){
  if(extSize === null){
    var size = {x:(this.wrapRef.current as any)!.clientWidth,y:(this.wrapRef.current as any)!.clientHeight};
    this.props.frameSetSize(this.props.id,size);
  } else {
    this.props.frameSetSize(this.props.id,extSize);
  }
 }
  resizeX(extSize:Position|null){
    if(extSize === null){
      var size = {x:(this.wrapRef.current as any)!.clientWidth,y:this.props.size.y};
      this.props.frameSetSize(this.props.id,size);
    } else {
      this.props.frameSetSize(this.props.id,{x:extSize.x,y:this.props.size.y});
    }
 }
 resizeY(extSize:Position|null){
  if(extSize === null){
    var size = {x:this.props.size.x,y:(this.wrapRef.current as any)!.clientHeight};
    this.props.frameSetSize(this.props.id,size);
  } else {
    this.props.frameSetSize(this.props.id,{x:this.props.size.x,y:extSize.y});
  }
 }
 componentDidUpdate(prevProps:any){
  var size = {x:(this.wrapRef.current as any)!.clientWidth,y:(this.wrapRef.current as any)!.clientHeight};
  if(this.props.size.y!=size.y || this.props.size.x!=size.x){
    //sync redux stored sizes with actual DOM sizes
    this.resize(null);
  }
  if(this.props.embedLink===null){
    //determine text max width: by embed element or default width;
    if(/*prevent rerender*/this.state.maxTextWidth!=this.props.frameW) this.setState({maxTextWidth:this.props.frameW});
  } else {/*if embed added to element*/
    if(/*if embed is loaded*/this.props.embedLink.maxSizes!==null && /*prevent rerender*/this.state.maxTextWidth!=this.props.embedLink.maxSizes.x) this.setState({maxTextWidth:this.props.embedLink.maxSizes.x});
  }
 }
 shouldComponentUpdate(nextProps:any){
  if(nextProps.editId!=this.props.id && this.props.editId==this.props.id){
    if(this.relabelRef.current.value.length!=0){
      this.props.frameRelabelled(this.props.id,this.relabelRef.current.value);
    }
  }
  return(true);
  }
 componentDidMount(){
    if(this.props.embedLink===null){
      //links added and loaded
      this.setState({maxTextWidth:this.props.frameW});
    } else {
      if(this.props.embedLink.maxSizes!==null) this.setState({maxTextWidth:this.props.embedLink.maxSizes.x});
    }
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
    if(this.props.editId!==this.props.id){
      // this.props.effectSetStart('pseudolinkEffect',{x: e.pageX,
      //   y: e.pageY});
      // this.props.effectSetEnd('pseudolinkEffect',{x: e.pageX,
      //   y: e.pageY});
      // this.props.effectSetId('pseudolinkEffect',this.props.id);
      this.props.pseudolinkCallback(this.props.id,{x: e.pageX,y:e.pageY},true);
      // this.props.effectSetActive('pseudolinkEffect',true); //todo: 4 actions -> 1 action
    }
  },
  onMouseUpElement:(e:MouseEvent)=>{
    if (e.button !== 0) return;
    this.props.createLinkCallback(this.props.id);
  }
 }
 wrapHandlers = {
    onDoubleClick:(e:MouseEvent)=>{
      if(this.props.editId===null){
        this.props.frameSetEdit(this.props.id);              
      }
    }
 }
 renderText(){
  if(this.props.editId===this.props.id){
    return(
      <div className='w-100 pm-0'>
        <ScalableTextarea className='pm-0 textarea' 
                          style={{
                                 fontSize:_fontSize,
                                }}
                          zoomMultiplier={this.props.zoomMultiplier} 
                          rows={3} 
                          passedRef={this.relabelRef} 
                          defaultValue={this.props.text}/>
        {this.props.embedLink===null && <ControlBox_w id={this.props.id} 
        embedPopupCallback={this.props.popupCallback}/>}
      </div>
    );
  } else {
    return(
      <ScalableDiv passedRef={this.textRef}
      zoomMultiplier={this.props.zoomMultiplier}
      style={{
              maxWidth:this.state.maxTextWidth,
              fontSize:_fontSize,
              marginBottom:_framePadding,
              marginLeft:_framePadding,
              marginRight:_framePadding
             }}
      className={this.props.embedLink? 'frame text-embed' : 'frame text'}>
        {this.props.text}
      </ScalableDiv>
      )
  }
 }
 loadEmbed(){
    var deleteEmbed = ()=>{
      this.props.embedRemoved(this.props.id);
    }
    var onError = ()=>{
      this.props.embedAdded(this.props.id,'image',require('./noimage.png'),{x:400,y:400});
    }
    if(this.props.embedLink!==null && this.props.embedLink.maxSizes!==null){
      switch(this.props.embedLink.type as string){
        case 'image':{
          var img = 
                      <ScalableImg ref={this.embedRef} 
                                   zoomMultiplier={this.props.zoomMultiplier}
                                   draggable={false}
                                   style={{
                                          verticalAlign: 'bottom',
                                          borderBottomLeftRadius:_borderRadius,
                                          borderBottomRightRadius:_borderRadius,
                                          paddingTop:_framePadding*0.6,
                                          width:this.props.embedLink.maxSizes.x,
                                          height:this.props.embedLink.maxSizes.y,
                                        }} 
                                   src={this.props.embedLink.url}
                                   onError={onError}>
                      </ScalableImg>           
                   
          if(this.props.editId===this.props.id){
            return(
              <div>
                  <ScalableDiv zoomMultiplier={this.props.zoomMultiplier}
                               className='embedDeleteTooltip pm-0'
                               style={{
                                  borderRadius:_borderRadius,
                                  display:'flex',
                                  flexDirection:'row-reverse',
                                  width:'100%',
                                  height:'50px'}}>
                    <div style={{width:'50%',height:'100%',display:'flex',flexDirection:'row-reverse'}}>
                      <ScalableButton className='holoButton h-100'
                                      style={{
                                        borderRadius:0,
                                        fontSize:_fontSize
                                      }}
                                      zoomMultiplier={this.props.zoomMultiplier}
                                      onClick={()=>{deleteEmbed()}}>
                        <i className="bi bi-trash"></i>
                      </ScalableButton>         
                    </div>
                    <div style={{width:'50%',height:'100%',display:'flex',flexDirection:'row'}}>
                      <ScalableButton className='holoButton h-100 m-0'
                                      style={{
                                        borderRadius:0,
                                        fontSize:30
                                      }}
                                      zoomMultiplier={this.props.zoomMultiplier}
                                      onClick={(e: any)=>{
                                        this.props.embedScaleMaxSize(this.props.id,'xy',0.9);
                                      }}>
                          <i className="bi bi-zoom-out"></i>
                      </ScalableButton> 
                      <ScalableButton className='holoButton h-100 m-0'
                                      style={{
                                        borderRadius:0,
                                        fontSize:30
                                      }}
                                      zoomMultiplier={this.props.zoomMultiplier}
                                      onClick={(e: any)=>{
                                        this.props.embedScaleMaxSize(this.props.id,'xy',1.1);
                                      }}>
                          <i className="bi bi-zoom-in"></i>
                      </ScalableButton>  
                    </div>
                </ScalableDiv>
                {img}
              </div>
              );
          } else {
            return(img);
          }
        }
      }
    }
 }
 render(){
    return(
      <div style={{zIndex:this.props.zIndex}}>
        <ScalableDiv className={this.props.isSelected ? 'frame wrap active' : 'frame wrap'} 
                     zoomMultiplier={this.props.zoomMultiplier}
                     immutableStyles = {['left','top']}
                     style={{
                      borderRadius:_borderRadius,
                      left:this.props.position.x,
                      top:this.props.position.y,
                     }} 
                     passedRef={this.wrapRef}>
              <ScalableDiv className='frame handle'
                           style={{
                              marginBottom: _framePadding,
                              height:_handleHeight,
                              borderTopLeftRadius:_borderRadius,
                              borderTopRightRadius:_borderRadius,
                            }} 
                            zoomMultiplier={this.props.zoomMultiplier}
                            passedRef={this.handleRef}>

              </ScalableDiv>
              <div ref={this.contentRef} style={{alignItems:'center',justifyContent:'center',textAlign:'center'}}>     
                {this.renderText()}
                <div className='frame embed'>
                  {this.loadEmbed()}
                </div>
              </div>
        {/* </div> */}
        </ScalableDiv>
     </div>
    );
 }
}
const Frame_w = frameConnector(Frame);

function mapPseudolinkState(state:RootState){
  return{
    zoomMultiplier: state.zoomReducer.zoomMultiplier,
    effectsDataPseudolink: state.overlayEffectsReducer.effects.data.pseudolinkEffect
  }
}
const mapPseudolinkDispatch = (dispatch:RootDispatch)=>({
  linkAdded:(frame1:number,frame2:number)=>{dispatch(graphSlice.actions.linkAdded({link:{frame1,frame2}}))},
  pseudolinkEffectSetStartFrame:(id:number|null)=>{dispatch(overlayEffectsSlice.actions.pseudolinkEffectSetStartFrame({id:id}))},
  pseudolinkEffectSetEndFrame:(id:number|null)=>{dispatch(overlayEffectsSlice.actions.pseudolinkEffectSetEndFrame({id:id}))},
});
const pseudolinkConnector = connect(mapPseudolinkState,mapPseudolinkDispatch);
interface pseudolinkProps extends ConnectedProps<typeof pseudolinkConnector>{}
class Pseudolink extends React.Component<pseudolinkProps,{}>{
  componentDidUpdate(prevProps:pseudolinkProps){
    if(this.props.effectsDataPseudolink.endFrame !== prevProps.effectsDataPseudolink.endFrame
      && this.props.effectsDataPseudolink.endFrame!==undefined && this.props.effectsDataPseudolink.startFrame!==undefined
      && this.props.effectsDataPseudolink.endFrame!==null && this.props.effectsDataPseudolink.startFrame!==null){
        console.log('pass',this.props.effectsDataPseudolink.endFrame,this.props.effectsDataPseudolink.endFrame);
        this.props.linkAdded(this.props.effectsDataPseudolink.startFrame,this.props.effectsDataPseudolink.endFrame);
        this.props.pseudolinkEffectSetStartFrame(null);
        this.props.pseudolinkEffectSetEndFrame(null);
      }
    return true;
  }
  render(){
    return(
      <svg style={{position:'absolute',overflow:'visible'}}>
          {this.props.effectsDataPseudolink.isActive&&
           <ScalableSvgLine 
            x1={this.props.effectsDataPseudolink.startPos.x}
            y1={this.props.effectsDataPseudolink.startPos.y}
            x2={this.props.effectsDataPseudolink.endPos.x}
            y2={this.props.effectsDataPseudolink.endPos.y}
            id='svg-line'
            style={{
              strokeWidth:_lineStrokeWidth
            }}
            zoomMultiplier={this.props.zoomMultiplier}/>
          }
      </svg>
    );
  }
}
const Pseudolink_w = pseudolinkConnector(Pseudolink);

function mapLineState(state:RootState){
  return{
    zoomMultiplier: state.zoomReducer.zoomMultiplier
  }
}
const mapLineDispatch = (dispatch:RootDispatch) =>({
  linkAdded:(frame1:number,frame2:number)=>{dispatch(graphSlice.actions.linkAdded({link:{frame1,frame2}}))},
  linkRemoved:(id1:number,id2:number)=>{dispatch(graphSlice.actions.linkRemoved({id1:id1,id2:id2}))}
});

var lineConnector = connect(mapLineState,mapLineDispatch);
interface LineProps extends ConnectedProps<typeof lineConnector>{
  x1:number,
  y1:number,
  x2:number,
  y2:number,
  id1:number,
  id2:number,
}
class Line extends React.Component<LineProps,{}>{
  ref = React.createRef<any>();

  onDoubleClick=(e: any)=>{
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
      <ScalableSvgLine x1={this.props.x1} 
                       y1={this.props.y1} 
                       x2={this.props.x2} 
                       y2={this.props.y2} 
                       className='line'
                       style={{
                        strokeWidth:_lineStrokeWidth
                       }}
                       zoomMultiplier={this.props.zoomMultiplier}
                       passedRef={this.ref}/>
    );
  }
}
const Line_w = lineConnector(Line);

function mapLinkState(state:RootState){
  return{
    zoomMultiplier: state.zoomReducer.zoomMultiplier
  }
}
var linkConnector = connect(mapLinkState);
interface LinkProps extends ConnectedProps<typeof linkConnector>{
  zIndex:number,
  x1:number,
  y1:number,
  x2:number,
  y2:number,
  id1:number,
  id2:number,
  zoomMultiplier:number
}
class Link extends React.Component<LinkProps,{}>{
  ref = React.createRef<HTMLInputElement>();
  constructor(props:any){
    super(props);
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
const Link_w = linkConnector(Link);



function mapClickboxState(state:RootState){
  return{
    editId: state.frameEditReducer.editId,
    selectedIds: state.graphReducer.selectedIds,

    effectsDataSelectionBox: state.overlayEffectsReducer.effects.data.selectionBoxEffect,
    effectsDataPseudodrag: state.overlayEffectsReducer.effects.data.pseudodragEffect,

    zoomMultiplier: state.zoomReducer.zoomMultiplier
  }
}
const mapClickboxDispatch = (dispatch:RootDispatch)=>({
  frameSetEdit:(id:number|null)=>{dispatch(frameEditSlice.actions.frameSetEdit({id:id}))},
  effectSetStart:(type:OverlayEffectTypes['types'],startPos:Position)=>{dispatch(overlayEffectsSlice.actions.effectSetStart({type:type,startPos:startPos}))},
  effectSetEnd:(type:OverlayEffectTypes['types'],endPos:Position)=>{dispatch(overlayEffectsSlice.actions.effectSetEnd({type:type,endPos:endPos}))},
  effectSetActive:(type:OverlayEffectTypes['types'],isActive:boolean)=>{dispatch(overlayEffectsSlice.actions.effectSetActive({type:type,isActive:isActive}))},

  framesMovedRelativeSinglePosition:(ids:number[],position:Position)=>{dispatch(graphSlice.actions.framesMovedRelativeSinglePosition({ids:ids,position:position}))},
  framesMovedRelativeSinglePositionAll:(position:Position)=>{dispatch(graphSlice.actions.framesMovedRelativeSinglePositionAll({position:position}))},
  dragEffectsClear:()=>{dispatch(overlayEffectsSlice.actions.dragEffectsClear({}))},
  disableAllEffects:()=>{dispatch(overlayEffectsSlice.actions.disableAllEffects({}))}
});
var clickboxConnector = connect(mapClickboxState,mapClickboxDispatch);
interface ClickboxProps extends ConnectedProps<typeof clickboxConnector>{
  areaSelectionCallback: (arg0: any, arg1: any) => void,
  areaDeselectionCallback: (arg0: any, arg1: any) => void,
  zIndex:number,

}
class Clickbox extends React.Component<ClickboxProps,{}>{
  selectionBoxRef = React.createRef<HTMLDivElement>();
  clickboxRef = React.createRef<HTMLDivElement>();
  constructor(props:any){
    super(props);
  }
  clickboxHandlers={
    onScroll:(e:any)=>{
      if(!e.shiftKey){
        if(e.deltaY<0){
          this.props.framesMovedRelativeSinglePositionAll({x:0,y:30*this.props.zoomMultiplier});
        } else {
          this.props.framesMovedRelativeSinglePositionAll({x:0,y:-30*this.props.zoomMultiplier});
        }
      } else {
        if(e.deltaY<0){
          this.props.framesMovedRelativeSinglePositionAll({x:30*this.props.zoomMultiplier,y:0});
        } else {
          this.props.framesMovedRelativeSinglePositionAll({x:-30*this.props.zoomMultiplier,y:0});
        }
      }
    
    },
    onMouseDown:(e: any)=>{
        if (e.button === 0){
          if(this.props.editId!==null){
            this.props.frameSetEdit(null);
          } else {
            this.props.effectSetStart('selectionBoxEffect',{x: e.pageX,
              y: e.pageY});
            this.props.effectSetEnd('selectionBoxEffect',{x: e.pageX,
              y: e.pageY});
            this.props.effectSetActive('selectionBoxEffect',true);
          }
        }
      },
    onMouseUp:(e:any)=>{
      if(this.props.effectsDataSelectionBox.isActive){ //todo: unlink effects isActive from positions to fix redundant clickbox redraw
        this.props.areaSelectionCallback(this.props.effectsDataSelectionBox.startPos,this.props.effectsDataSelectionBox.endPos);
      }
      if(this.props.effectsDataPseudodrag.isActive){
        this.props.framesMovedRelativeSinglePosition(this.props.selectedIds,posOp({x:e.pageX,y:e.pageY},'-',this.props.effectsDataPseudodrag.startPos));
      }
      this.props.disableAllEffects();
      this.props.dragEffectsClear();
    }
   }
   componentDidMount(){
    (this.clickboxRef.current)!.addEventListener('scroll', this.clickboxHandlers.onScroll);
    (this.clickboxRef.current)!.addEventListener('mousedown', this.clickboxHandlers.onMouseDown);
    document.addEventListener('mouseup', this.clickboxHandlers.onMouseUp);
    document.addEventListener('wheel', this.clickboxHandlers.onScroll);
  }
  componentWillUnmount(){
    (this.clickboxRef.current)!.removeEventListener('scroll', this.clickboxHandlers.onScroll);
    (this.clickboxRef.current)!.removeEventListener('mousedown', this.clickboxHandlers.onMouseDown);
    document.removeEventListener('wheel', this.clickboxHandlers.onScroll);
  }
  render(){
    return(
      <div className={'clickbox'} ref={this.clickboxRef} style={{zIndex:this.props.zIndex,height:'100vh',width:'100vw',position:'absolute'}}>

      </div>
    );
  }
}
const Clickbox_w = clickboxConnector(Clickbox);



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

function mapTrackerState(state:RootState){
  return{
    effectsDataAll: state.overlayEffectsReducer.effects.data,
    zoomMultiplier: state.zoomReducer.zoomMultiplier,
  }
}
const mapTrackerDispatch = (dispatch:RootDispatch)=>({
  frameSetEdit:(id:number|null)=>{dispatch(frameEditSlice.actions.frameSetEdit({id:id}))},
  effectSetStart:(type:OverlayEffectTypes['types'],startPos:Position)=>{dispatch(overlayEffectsSlice.actions.effectSetStart({type:type,startPos:startPos}))},
  effectSetEnd:(type:OverlayEffectTypes['types'],endPos:Position)=>{dispatch(overlayEffectsSlice.actions.effectSetEnd({type:type,endPos:endPos}))},

  framesMoved:(ids:number[],positions:Position[])=>{dispatch(graphSlice.actions.framesMoved({ids:ids,positions:positions}))}
});
var trackerConnector = connect(mapTrackerState,mapTrackerDispatch);
interface TrackerProps extends ConnectedProps<typeof trackerConnector>{}
class Tracker extends React.Component<TrackerProps,{}>{
  constructor(props:any){
    super(props);
  }
  track(e:any){
    if(this.props.effectsDataAll['pseudolinkEffect'].isActive){
      this.props.effectSetEnd('pseudolinkEffect',{x: e.pageX,
        y: e.pageY});
    }
    if(this.props.effectsDataAll['selectionBoxEffect'].isActive){
      this.props.effectSetEnd('selectionBoxEffect',{x: e.pageX,
        y: e.pageY});
    }
    if(this.props.effectsDataAll['pseudodragEffect'].isActive){
      this.props.effectSetEnd('pseudodragEffect',{x: e.pageX,
        y: e.pageY});
    }
    if(this.props.effectsDataAll['dragEffect'].isActive){
      var positions:Position[] = []; 
      this.props.effectsDataAll['dragEffect'].keys.forEach((keyId:number)=>{
        positions.push(posOp({x:e.pageX,y:e.pageY},'-',this.props.effectsDataAll.dragEffect.data[keyId].startPos));
      });
      this.props.framesMoved(this.props.effectsDataAll['dragEffect'].keys,positions);
    }
  }
  onMouseMove=(e:any)=>{
    this.track(e);
  }
  componentDidMount(){
    document.addEventListener('mousemove',throttle(this.onMouseMove,10));
  }
  componentWillUnmount(){
    document.removeEventListener('mousemove',throttle(this.onMouseMove,10));
  }
  render(){
    return(false);
  }
}
const Tracker_w = trackerConnector(Tracker);


function selectionBoxState(state:RootState){
  return{
    zoomMultiplier: state.zoomReducer.zoomMultiplier,
    effectsDataSelectionBox: state.overlayEffectsReducer.effects.data.selectionBoxEffect
  }
}
var selectionBoxConnector = connect(selectionBoxState);
interface SelectionBoxProps extends ConnectedProps<typeof selectionBoxConnector>{
  zIndex:number
}
class SelectionBox extends React.Component<SelectionBoxProps,{}>{
  createSelectionRectangle(startPosition:Position,endPosition:Position){
    return(
      <svg style={{position:'absolute',overflow:'visible'}}>
        <ScalableSvgLine x1={startPosition.x} 
                         y1={startPosition.y}
                         x2={endPosition.x} 
                         y2={startPosition.y}
                         id='svg-selectionBox'
                         style={{
                          strokeWidth:_lineStrokeWidth
                         }}
                         zoomMultiplier={this.props.zoomMultiplier}/>
        <ScalableSvgLine x1={endPosition.x} 
                         y1={startPosition.y}
                         x2={endPosition.x} 
                         y2={endPosition.y}
                         id='svg-selectionBox'
                         style={{
                          strokeWidth:_lineStrokeWidth
                         }}
                         zoomMultiplier={this.props.zoomMultiplier}/>
        <ScalableSvgLine x1={endPosition.x} 
                         y1={endPosition.y}
                         x2={startPosition.x} 
                         y2={endPosition.y}
                         id='svg-selectionBox'
                         style={{
                          strokeWidth:_lineStrokeWidth
                         }}
                         zoomMultiplier={this.props.zoomMultiplier}/>
        <ScalableSvgLine x1={startPosition.x} 
                         y1={endPosition.y}
                         x2={startPosition.x} 
                         y2={startPosition.y}
                         id='svg-selectionBox'
                         style={{
                          strokeWidth:_lineStrokeWidth
                         }}
                         zoomMultiplier={this.props.zoomMultiplier}/>
      </svg>
    );
  }
  render() {
    return(
      <div style={{position:'absolute',pointerEvents:'none'}}>
        {this.props.effectsDataSelectionBox.isActive && 
          <svg style={{position:'absolute',overflow:'visible',pointerEvents:'none',zIndex:this.props.zIndex}}>
              {this.createSelectionRectangle(this.props.effectsDataSelectionBox.startPos as Position,
                                            this.props.effectsDataSelectionBox.endPos as Position)
              }
          </svg>
        }
      </div>
    );
  }
}
const SelectionBox_w = selectionBoxConnector(SelectionBox);

function pseudodragBoxState(state:RootState){
  return{
    zoomMultiplier: state.zoomReducer.zoomMultiplier,
    effectsDataPseudodrag: state.overlayEffectsReducer.effects.data.pseudodragEffect
  }
}
var pseudodragBoxConnector = connect(pseudodragBoxState);
interface PseudodragBoxProps extends ConnectedProps<typeof pseudodragBoxConnector>{
  zIndex:number
}
class PseudodragBox extends React.Component<PseudodragBoxProps,{}>{
  createSelectionRectangle(startPosition:Position,endPosition:Position){
    return(
      <svg style={{position:'absolute',overflow:'visible'}}>
        <ScalableSvgLine x1={startPosition.x} 
                         y1={startPosition.y}
                         x2={endPosition.x} 
                         y2={startPosition.y}
                         id='svg-selectionBox'
                         style={{
                          strokeWidth:_lineStrokeWidth
                         }}
                         zoomMultiplier={this.props.zoomMultiplier}/>
        <ScalableSvgLine x1={endPosition.x} 
                         y1={startPosition.y}
                         x2={endPosition.x} 
                         y2={endPosition.y}
                         id='svg-selectionBox'
                         style={{
                          strokeWidth:_lineStrokeWidth
                         }}
                         zoomMultiplier={this.props.zoomMultiplier}/>
        <ScalableSvgLine x1={endPosition.x} 
                         y1={endPosition.y}
                         x2={startPosition.x} 
                         y2={endPosition.y}
                         id='svg-selectionBox'
                         style={{
                          strokeWidth:_lineStrokeWidth
                         }}
                         zoomMultiplier={this.props.zoomMultiplier}/>
        <ScalableSvgLine x1={startPosition.x} 
                         y1={endPosition.y}
                         x2={startPosition.x} 
                         y2={startPosition.y}
                         id='svg-selectionBox'
                         style={{
                          strokeWidth:_lineStrokeWidth
                         }}
                         zoomMultiplier={this.props.zoomMultiplier}/>
      </svg>
    );
  }
  render() {
    return(
      <div style={{position:'absolute',pointerEvents:'none'}}>
        {this.props.effectsDataPseudodrag.isActive &&
          <svg style={{position:'absolute',overflow:'visible',pointerEvents:'none',zIndex:this.props.zIndex}}>
              {this.createSelectionRectangle(posOp(this.props.effectsDataPseudodrag.endPos,'-',this.props.effectsDataPseudodrag.deltaStart),
                                            posOp(this.props.effectsDataPseudodrag.endPos,'+',this.props.effectsDataPseudodrag.deltaEnd))
              }
          </svg>
        }
      </div>
    );
  }
}
const PseudodragBox_w = pseudodragBoxConnector(PseudodragBox);


function mapAppState(state:RootState){
  return{
    framesData: state.graphReducer.frames!.data,
    framesKeys: state.graphReducer.frames!.keys,
    links: state.graphReducer.links,
    selectedIds: state.graphReducer.selectedIds,

    editId: state.frameEditReducer.editId,

    slowMode: state.overlayEffectsReducer.slowMode
  }
}
const mapAppDispatch = (dispatch:RootDispatch)=>({
  frameAdded:(label:string,embedLink:EmbedData|null,position:Position,size?:Position)=>{dispatch(graphSlice.actions.frameAdded({label:label,embedLink:embedLink,position:position,size:size}))},
  framesRemoved:(ids:number[])=>{dispatch(graphSlice.actions.framesRemoved({ids:ids}))},
  linkAdded:(frame1:number,frame2:number)=>{dispatch(graphSlice.actions.linkAdded({link:{frame1,frame2}}))},
  linkRemoved:(id1:number,id2:number)=>{dispatch(graphSlice.actions.linkRemoved({id1:id1,id2:id2}))},
  
  elementsSelected:(ids:number[])=>{dispatch(graphSlice.actions.elementsSelected({ids:ids}))},
  elementsDeselected:(ids:number[])=>{dispatch(graphSlice.actions.elementsDeselected({ids:ids}))},
  
  frameSetEdit:(id:number|null)=>{dispatch(frameEditSlice.actions.frameSetEdit({id:id}))},

  effectSetStart:(type:OverlayEffectTypes['types'],startPos:Position)=>{dispatch(overlayEffectsSlice.actions.effectSetStart({type:type,startPos:startPos}))},
  effectSetEnd:(type:OverlayEffectTypes['types'],endPos:Position)=>{dispatch(overlayEffectsSlice.actions.effectSetEnd({type:type,endPos:endPos}))},
  effectSetActive:(type:OverlayEffectTypes['types'],isActive:boolean)=>{dispatch(overlayEffectsSlice.actions.effectSetActive({type:type,isActive:isActive}))},
  effectSetId:(type:OverlayEffectTypes['types'],id:number)=>{dispatch(overlayEffectsSlice.actions.effectSetId({type:type,id:id}))},

  dragEffectAdded:(id:number,startPos:Position,endPos:Position)=>{dispatch(overlayEffectsSlice.actions.dragEffectAdded({id:id,startPos:startPos,endPos:endPos}))},
  dragEffectSetEndPos:(id:number,endPos:Position)=>{dispatch(overlayEffectsSlice.actions.dragEffectSetEndPos({id:id,endPos:endPos}))},
  pseudodragEffectSetDeltaStart:(delta:Position)=>{dispatch(overlayEffectsSlice.actions.pseudodragEffectSetDeltaStart({delta:delta}))},
  pseudodragEffectSetDeltaEnd:(delta:Position)=>{dispatch(overlayEffectsSlice.actions.pseudodragEffectSetDeltaEnd({delta:delta}))},
  pseudodragEffectSetSize:(size:Position)=>{dispatch(overlayEffectsSlice.actions.pseudodragEffectSetSize({size:size}))},
  pseudolinkEffectSetStartFrame:(id:number)=>{dispatch(overlayEffectsSlice.actions.pseudolinkEffectSetStartFrame({id:id}))},
  pseudolinkEffectSetEndFrame:(id:number)=>{dispatch(overlayEffectsSlice.actions.pseudolinkEffectSetEndFrame({id:id}))},

  embedAdded:(id:number,type:string,url:string,maxSizes:Position)=>{dispatch(graphSlice.actions.embedAdded({id:id,type:type,url:url,maxSizes:maxSizes}))},
});
var appConnector = connect(mapAppState,mapAppDispatch);
interface AppProps extends  ConnectedProps<typeof appConnector>{
  scrollbarsVisibility:boolean
}
class App extends React.Component<AppProps,{frameBuffer:any[],popupView:boolean,popupId:number}>{
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
      } // cs
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
    //embed content initial load
    this.props.framesKeys.forEach((id:number)=>{
      const frameData = this.props.framesData[id];
      if(frameData.embedLink!=null){
        this.loadEmbed(id,frameData.embedLink.url);
      }
    });
  }
  componentWillUnmount(){
    document.addEventListener('keydown',this.globalHandlers.onKeyDown);
  }
  createLinkCallback=(fromId:number)=>{
    console.log('setEndFrame');
    this.props.pseudolinkEffectSetEndFrame(fromId);
  }
  //embed
  loadEmbed=(id:number,url:string)=>{
    var img = new Image();
    img.src = url;
    img.onload = ()=>{
      var ratio = img.width/img.height;
      if(ratio>=1){ //horizontal orientation
        const size = {x:400,y:400/ratio};
        this.props.embedAdded(id,'image',url,size);
      } else { //vertical orientation
        const size = {x:400,y:400/ratio};
        this.props.embedAdded(id,'image',url,size);
      }
    }
  }
  //drag
  dragCallback=(fromId:number,eventX:number,eventY:number)=>{
    if(this.props.slowMode){
        if(this.props.selectedIds.length>0){
          var max_x=0;
          var max_y=0;
          var min_x=999999;
          var min_y=999999;
  
          this.props.selectedIds.forEach((selectedId:number)=>{
            var topLeft = {
                            x:this.props.framesData[selectedId].position.x,
                            y:this.props.framesData[selectedId].position.y
                          }
            var bottomRight = {
                                x:this.props.framesData[selectedId].position.x+this.props.framesData[selectedId].size.x,
                                y:this.props.framesData[selectedId].position.y+this.props.framesData[selectedId].size.y
                              }
            if(bottomRight.x > max_x){max_x=bottomRight.x};
            if(bottomRight.y > max_y){max_y=bottomRight.y};
            if(topLeft.x < min_x){min_x=topLeft.x};
            if(topLeft.y < min_y){min_y=topLeft.y};
          });
          var borderTopLeft = {x:min_x,y:min_y};
          var borderBottomRight = {x:max_x,y:max_y};
  
          this.props.effectSetStart('pseudodragEffect',{x:eventX,y:eventY});
          this.props.effectSetEnd('pseudodragEffect',{x:eventX,y: eventY});
          this.props.pseudodragEffectSetDeltaStart(posOp({x:eventX,y:eventY},'-',{x:borderTopLeft.x,y:borderTopLeft.y}));
          this.props.pseudodragEffectSetDeltaEnd(posOp({x:borderBottomRight.x,y:borderBottomRight.y},'-',{x:eventX,y:eventY}));
          this.props.pseudodragEffectSetSize({x:borderBottomRight.x-borderTopLeft.x,y:borderBottomRight.y-borderTopLeft.y});
  
         this.props.effectSetActive('pseudodragEffect',true); 
        } else {
          //single element drag
            this.props.dragEffectAdded(fromId,
              {x:eventX-this.props.framesData[fromId].position.x,y:eventY-this.props.framesData[fromId].position.y}, 
              {x:eventX,y:eventY});
            this.props.effectSetActive('dragEffect',true); 
        }   
    } else {
    //no slow mode
      if(this.props.selectedIds.includes(fromId)){
        this.props.selectedIds.forEach((selectedId:number)=>{
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
  }
  pseudoLinkCallback=(id:number,eventPos:Position,state:boolean)=>{
        // x1={this.props.position.x+this.props.size.x/2} 
        // y1={this.props.position.y+this.props.size.y/2} 
        // x2={this.props.effectsDataPseudolink.endPos!.x} 
        // y2={this.props.effectsDataPseudolink.endPos!.y} 
      this.props.effectSetStart('pseudolinkEffect',{x: eventPos.x,
        y: eventPos.y});
      this.props.effectSetEnd('pseudolinkEffect',{x: eventPos.x,
        y: eventPos.y});
      this.props.effectSetId('pseudolinkEffect',id);
      this.props.pseudolinkEffectSetStartFrame(id);
      console.log('setStartFrame');
      this.props.effectSetActive('pseudolinkEffect',state); 
  }
  popupCallback=(isVisible:boolean,id:number)=>{
    this.setState({popupView:isVisible,popupId:id});
  }
  popupExternalAction=(isVisible:boolean,value:string)=>{
    this.setState({popupView:isVisible});
    this.loadEmbed(this.state.popupId,value);
  }
  renderFramesFromProps(zIndex:number):JSX.Element[]{
    console.log(this.props.framesKeys.length);
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
                       frameH={_frameMinHeight} 
                       frameW={_frameMinWidth} 
               isSelected={isSelected}
               dragCallback={this.dragCallback}
               createLinkCallback={this.createLinkCallback}
               popupCallback={this.popupCallback}
               pseudolinkCallback={this.pseudoLinkCallback}
               />
      );
    });
    return(arr);
  }
  render(){
    return(
      <div style={{position:'absolute',overflow:'hidden'}} 
           className={this.props.scrollbarsVisibility? 'app' : 'app hideScrolls'}>
        {this.state.popupView && <Popup label='Enter image URL' externalStateAction={this.popupExternalAction}/>}
        <Tracker_w/>
        <Clickbox_w zIndex={1} areaSelectionCallback={this.selectElementsInArea.bind(this)}
                               areaDeselectionCallback={this.props.elementsDeselected}/>
        {this.renderFramesFromProps(2)}
        {this.renderLinksFromProps(2)}
        <Pseudolink_w/>
        <SelectionBox_w zIndex={999}/>                        
        <PseudodragBox_w zIndex={999}/>
      </div>
    );
  };
}
const App_w = appConnector(App);
    
export default App_w;
