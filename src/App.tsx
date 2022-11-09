import React, {MouseEvent} from 'react';
import './App.scss';
import styles from './App.scss';  

import {LinkType,Position,FrameType,FrameElement,EffectType,OverlayEffectTypes,OverlayEffectPayload,EmbedData} from './app/interfaces'
import {ConnectedProps} from 'react-redux'
import {Popup} from './reusableComponents'
import {ScalableButton,ScalableSvgLine,ScalableDiv,ScalableImg,ScalableTextarea} from './scalableComponents'
import {
  zoomStateConnector,zoomDispatchConnector,

  elementEditStateConnector,elementsStateConnector,

  elementEditDispatchConnector,embedDispatchConnector,framesDispatchConnector,linksDispatchConnector,selectionDispatchConnector,
  
  pseudolinkEffectConnector,selectionBoxEffectConnector,dragEffectConnector,
  allEffectsConnector,effectsDispatchConnector,

  applyConnectors} from './app/mappers'

const _frameMinWidth = parseFloat(styles.frameMinWidth);
const _frameMinHeight = parseFloat(styles.frameMinHeight);
const _framePadding = parseFloat(styles.framePadding);

const _handleHeight = parseFloat(styles.handleHeight);
const _borderRadius = parseFloat(styles.borderRadius);

const _lineStrokeWidth = parseFloat(styles.lineStrokeWidth);
const _fontSize = 20;

interface ControlBoxProps extends ConnectedProps<typeof embedDispatchConnector>,
                                  ConnectedProps<typeof zoomStateConnector>{
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
const ControlBox_w = applyConnectors(ControlBox,[embedDispatchConnector,zoomStateConnector]);



interface FrameProps extends ConnectedProps<typeof pseudolinkEffectConnector>,
                             ConnectedProps<typeof selectionBoxEffectConnector>,
                             ConnectedProps<typeof elementEditStateConnector>,
                             ConnectedProps<typeof zoomStateConnector>,

                             ConnectedProps<typeof effectsDispatchConnector>,
                             ConnectedProps<typeof elementEditDispatchConnector>,
                             ConnectedProps<typeof embedDispatchConnector>,
                             ConnectedProps<typeof framesDispatchConnector>,
                             ConnectedProps<typeof linksDispatchConnector>,
                             ConnectedProps<typeof selectionDispatchConnector>
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
  popupCallback:(isVisible: boolean, id: number) => void
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
      this.props.effectSetStart('pseudolinkEffect',{x: e.pageX,
        y: e.pageY});
      this.props.effectSetEnd('pseudolinkEffect',{x: e.pageX,
        y: e.pageY});
      this.props.effectSetId('pseudolinkEffect',this.props.id);
      this.props.effectSetActive('pseudolinkEffect',true); //todo: 4 actions -> 1 action
    }
  },
  onMouseUpElement:(e:MouseEvent)=>{
    if (e.button !== 0) return;
    if(this.props.effectsDataPseudolink.isActive) this.props.createLinkCallback(this.props.id);
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
  var pseudolink:JSX.Element = 
    <ScalableSvgLine x1={this.props.position.x+this.props.size.x/2} 
                     y1={this.props.position.y+this.props.size.y/2} 
                     x2={this.props.effectsDataPseudolink.endPos!.x} 
                     y2={this.props.effectsDataPseudolink.endPos!.y} 
                     id='svg-line'
                     style={{
                        strokeWidth:_lineStrokeWidth
                     }}
                     zoomMultiplier={this.props.zoomMultiplier}/>
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
      <svg style={{position:'absolute',overflow:'visible'}}>
          {this.props.effectsDataPseudolink.isActive&&(this.props.effectsDataPseudolink.id==this.props.id)&&pseudolink}
      </svg>
     </div>
    );
 }
}
const Frame_w = applyConnectors(Frame,[pseudolinkEffectConnector,
                                      selectionBoxEffectConnector,
                                      elementEditStateConnector,
                                      zoomStateConnector,

                                      effectsDispatchConnector,
                                      elementEditDispatchConnector,
                                      embedDispatchConnector,
                                      framesDispatchConnector,
                                      linksDispatchConnector,
                                      selectionDispatchConnector]);







interface LineProps extends ConnectedProps<typeof linksDispatchConnector>,
                            ConnectedProps<typeof zoomStateConnector>{
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
const Line_w = applyConnectors(Line,[linksDispatchConnector]);


interface LinkProps extends ConnectedProps<typeof framesDispatchConnector>{
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
        id1={this.props.id1} id2={this.props.id2} zoomMultiplier={this.props.zoomMultiplier}/>
      </svg>
    );
  }
}
const Link_w = applyConnectors(Link,[framesDispatchConnector]);


interface ClickboxProps extends ConnectedProps<typeof selectionBoxEffectConnector>,
                                ConnectedProps<typeof elementEditStateConnector>,
                                ConnectedProps<typeof zoomStateConnector>,
                                ConnectedProps<typeof elementsStateConnector>,

                                ConnectedProps<typeof linksDispatchConnector>,
                                ConnectedProps<typeof effectsDispatchConnector>,
                                ConnectedProps<typeof elementEditDispatchConnector>,
                                ConnectedProps<typeof zoomDispatchConnector>,
                                ConnectedProps<typeof framesDispatchConnector>{

  areaSelectionCallback: (arg0: any, arg1: any) => void,
  zIndex:number,

}
class Clickbox extends React.Component<ClickboxProps,{}>{
  selectionBoxRef = React.createRef<HTMLDivElement>();
  clickboxRef = React.createRef<HTMLDivElement>();
  constructor(props:any){
    super(props);
  }
  clickboxHandlers={
    onMouseDown:(e: any)=>{
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
    },
    onMouseUp:(e:any)=>{
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
      <div className='clickbox' ref={this.clickboxRef} style={{zIndex:this.props.zIndex,height:'100vh',width:'100vw',position:'absolute'}}>

      </div>
    );
  }
}
const Clickbox_w = applyConnectors(Clickbox,[selectionBoxEffectConnector,
                                             elementEditStateConnector,
                                             zoomStateConnector,
                                             elementsStateConnector,

                                             linksDispatchConnector,
                                             zoomDispatchConnector,
                                             framesDispatchConnector,
                                             effectsDispatchConnector,
                                             elementEditDispatchConnector]);


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

interface TrackerProps extends ConnectedProps<typeof allEffectsConnector>,
                               ConnectedProps<typeof effectsDispatchConnector>,
                               ConnectedProps<typeof framesDispatchConnector>{

}
class Tracker extends React.Component<TrackerProps,{}>{
  constructor(props:any){
    super(props);
  }
  onMouseMove=(e:any)=>{
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
const Tracker_w = applyConnectors(Tracker,[allEffectsConnector, 
                                          effectsDispatchConnector,
                                          framesDispatchConnector])



interface SelectionBoxProps extends ConnectedProps<typeof selectionBoxEffectConnector>,
                                    ConnectedProps<typeof zoomStateConnector>,
                                    ConnectedProps<typeof effectsDispatchConnector>{
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
const SelectionBox_w = applyConnectors(SelectionBox,[selectionBoxEffectConnector,
                                                     zoomStateConnector,
                                                     effectsDispatchConnector]);


interface AppProps extends ConnectedProps<typeof elementsStateConnector>,
                           ConnectedProps<typeof pseudolinkEffectConnector>,
                           ConnectedProps<typeof elementEditStateConnector>,
                           ConnectedProps<typeof zoomStateConnector>,
                           
                           ConnectedProps<typeof embedDispatchConnector>,
                           ConnectedProps<typeof framesDispatchConnector>,
                           ConnectedProps<typeof linksDispatchConnector>,
                           ConnectedProps<typeof selectionDispatchConnector>,
                           ConnectedProps<typeof effectsDispatchConnector>,
                           ConnectedProps<typeof elementEditDispatchConnector>,
                           ConnectedProps<typeof zoomDispatchConnector>{
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
    this.props.linkAdded(fromId,this.props.effectsDataPseudolink.id);
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
  ///embed
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
  popupExternalAction=(isVisible:boolean,value:string)=>{
    this.setState({popupView:isVisible});
    this.loadEmbed(this.state.popupId,value);
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
                       frameH={_frameMinHeight} 
                       frameW={_frameMinWidth} 
               isSelected={isSelected}
               dragCallback={this.dragCallback}
               createLinkCallback={this.createLinkCallback}
               popupCallback={this.popupCallback}
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
const App_w = applyConnectors(App,[elementsStateConnector,
                                   pseudolinkEffectConnector,
                                   elementEditStateConnector,
                                   zoomStateConnector,

                                   zoomDispatchConnector,
                                   embedDispatchConnector,
                                   framesDispatchConnector,
                                   linksDispatchConnector,
                                   selectionDispatchConnector,
                                   effectsDispatchConnector,
                                   elementEditDispatchConnector]);
    
export default App_w;
