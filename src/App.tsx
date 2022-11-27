import React from 'react';
import logo from './logo.svg';
import './App.scss';
import {Button} from 'react-bootstrap';
import '../node_modules/bootstrap/scss/bootstrap.scss'
import ReactDOM from 'react-dom';
import {useState,useEffect,useRef} from 'react'

import type {State,LinkType,Position,Position4,FrameType} from './app/interfaces'
import {connect} from 'react-redux'
import {graphSlice,selectionSlice} from './app/reducers';
import type {RootState} from './app/store'
function mapState(state:RootState){
  return {
    framesData: state.graphReducer.frames!.data,
    framesKeys: state.graphReducer.frames!.keys,

    links: state.graphReducer.links,
    pseudolinks:state.graphReducer.pseudolinks,

    ids: state.selectionReducer.ids
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
  pseudolinkAdded:(id:number)=>{dispatch(graphSlice.actions.pseudolinkAdded({id:id}))},
  pseudolinksCleared:()=>{dispatch(graphSlice.actions.pseudolinksCleared({}))},

  elementsSelected:(selectedIds:number[])=>{dispatch(selectionSlice.actions.elementsSelected({selectedIds:selectedIds}))},
  elementsDeselected:(selectedIds:number[])=>{dispatch(selectionSlice.actions.elementsDeselected({selectedIds:selectedIds}))},
});

class Frame extends React.Component<{id:Readonly<number>,text:string,position:Position,size:Position,frameH:number,frameW:number,radius:number,isSelected:boolean
                                      initCallback:any,
                                      dragCallback:any,
                                      selectionCallback:any,
                                      deselectionCallback:any,
                                      pseudolinkCallback:any,
                                      deleteCallback:any
                                    },
                                    {dragging:boolean,rel:null|Position,pseudolinkPos:null|Position,pseudolinkDragging:boolean}>{
 wrapRef = React.createRef<any>();
 handleRef = React.createRef<any>();
 contentRef = React.createRef<any>();
 constructor(props:any){
  super(props);
  this.state = {dragging:false,rel:null,pseudolinkDragging:false,pseudolinkPos:{x:100,y:100}};
 }
 componentDidMount(){
    //handle box binding
    window.addEventListener('mousemove', this.handleHandlers.onMouseMove);
    document.addEventListener('mouseup', this.handleHandlers.onMouseUp);
    (this.handleRef.current)!.addEventListener('mousedown', this.handleHandlers.onMouseDown);

    //content box binding
    window.addEventListener('mousemove', this.contentHandlers.onMouseMove);
    document.addEventListener('mouseup', this.contentHandlers.onMouseUpDocument);
    (this.contentRef.current)!.addEventListener('mouseup', this.contentHandlers.onMouseUpElement);
    (this.contentRef.current)!.addEventListener('mousedown', this.contentHandlers.onMouseDown);

    //wrap box binding
    (this.wrapRef.current)!.addEventListener('dblclick', this.wrapHandlers.onDoubleClick);


    var size = {x:(this.wrapRef.current as any)!.clientWidth,y:(this.wrapRef.current as any)!.clientHeight};
    this.props.initCallback(this.props.id,size);
 }
 componentWillUnmount(){
  //handle box unbinding
  window.removeEventListener('mousemove', this.handleHandlers.onMouseMove);
  document.removeEventListener('mouseup', this.handleHandlers.onMouseUp);
  (this.handleRef.current)!.removeEventListener('mousedown', this.handleHandlers.onMouseDown);

  //content box unbinding
  window.removeEventListener('mousemove', this.contentHandlers.onMouseMove);
  document.removeEventListener('mouseup', this.contentHandlers.onMouseUpDocument);
  (this.contentRef.current)!.removeEventListener('mouseup', this.contentHandlers.onMouseUpElement);
  (this.contentRef.current)!.removeEventListener('mousedown', this.contentHandlers.onMouseDown);

  //wrap box unbinding
  (this.wrapRef.current)!.removeEventListener('dblclick', this.wrapHandlers.onDoubleClick);

 }
 handleHandlers = {
  onMouseDown:(e:MouseEvent)=>{
    if (e.button !== 0) return
    this.setState({
      dragging: true,
      rel: {
        x: e.pageX - this.props.position.x,
        y: e.pageY - this.props.position.y,
      }
    });
    // this.props.deselectionCallback([]);
    e.stopPropagation()
    e.preventDefault()
  
  },
  onMouseUp:(e:MouseEvent)=>{
    this.setState({dragging: false})
    e.stopPropagation()
    e.preventDefault()
  },
  onMouseMove:(e:MouseEvent)=>{
    if(!this.state.dragging) return;
    // this.ref.current!.style.zIndex+=1;
    this.props.dragCallback(this.props.id,{x:e.pageX-this.state.rel!.x,y:e.pageY-this.state.rel!.y});
    e.stopPropagation()
    e.preventDefault()
  }
 }
 contentHandlers = {
  onMouseDown:(e:MouseEvent)=>{
    if (e.button !== 0) return
    this.setState({
      pseudolinkDragging: true,

      pseudolinkPos: {
      x: e.pageX,
      y: e.pageY
      }
    });
    this.props.pseudolinkCallback(this.props.id,'start');
    e.stopPropagation()
    e.preventDefault()
  
  },
  onMouseUpDocument:(e:MouseEvent)=>{
    this.setState({pseudolinkDragging: false});
    this.props.pseudolinkCallback(this.props.id,'clear');
    e.stopPropagation()
    e.preventDefault()
  },
  onMouseUpElement:(e:MouseEvent)=>{
    this.props.pseudolinkCallback(this.props.id,'end');
  },
  onMouseMove:(e:MouseEvent)=>{
    if(!this.state.pseudolinkDragging) return;
    // this.ref.current!.style.zIndex+=1;
    this.setState({
      pseudolinkPos: {
      x: e.pageX,
      y: e.pageY
    }});
    e.stopPropagation()
    e.preventDefault()
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
  var overlayComponents:JSX.Element[] = [<div></div>];
  if(this.state.pseudolinkDragging){
    overlayComponents=[
      <svg style={{position:'absolute',overflow:'visible'}}>
        <line x1={this.props.position.x+this.props.size.x/2} y1={this.props.position.y+this.props.size.y/2} 
              x2={this.state.pseudolinkPos!.x} y2={this.state.pseudolinkPos!.y} style={{
          stroke:'red',
          strokeWidth:1,
          cursor:'pointer',
          zIndex:1
        }}>
        </line>
      </svg>
    ]
  }
  if(this.props.isSelected){
    return(
      <div>
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
     {overlayComponents}
     </div>
    );
  } else {
    return(
      <div>
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
     {overlayComponents}
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

class Link extends React.Component<{x1:number,y1:number,x2:number,y2:number,deleteCallback:any,id1:number,id2:number},{offset:Position4}>{
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
      <svg style={{position:'absolute',overflow:'visible'}}>
        <Line x1={this.props.x1} y1={this.props.y1} x2={this.props.x2} y2={this.props.y2} 
          deleteCallback={this.props.deleteCallback} id1={this.props.id1} id2={this.props.id2}/>
      </svg>
    );
  }
}
class App extends React.Component<any>{
  frameW = 150;
  frameH = 40;
  constructor(props:any){
    super(props);
  }
  keyboardHandlers={
    onKeyDown:(e:KeyboardEvent)=>{
      if(e.key == 'Delete'){
        var idsToDelete = [] as number[];
        this.props.ids!.forEach((selectedId:number)=>idsToDelete.push(selectedId));
        this.props.framesRemoved(idsToDelete);
      }
    }
   }
  componentDidMount(){
    document.addEventListener('keydown',this.keyboardHandlers.onKeyDown);
  }
  componentWillUnmount(){
    document.removeEventListener('keydown',this.keyboardHandlers.onKeyDown);
  }
  renderLinksFromProps(){
    var links = this.props.links.map((link:LinkType) =>{
      console.log('trying link',link.frame1,link.frame2);
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
  pseudolinkCallback=(fromId:number,actionType:string)=>{
    switch(actionType){
      case 'start':{
        this.props.pseudolinkAdded(fromId);
        break;
      }
      case 'end':{
        this.props.linkAdded(fromId,this.props.pseudolinks.at(0));
        this.props.pseudolinksCleared();
        break;
      }
      case 'clear':{
        this.props.pseudolinksCleared();
        break;
      }
    }
  }

  //todo refactor
  renderFramesFromProps():JSX.Element[]{
    var arr = this.props.framesKeys.map((id:number) =>{
      var isSelected = false;
      if(this.props.ids.includes(id)){
        isSelected = true;
      }
      return(
        <Frame id={id} text={this.props.framesData[id].label} 
                       position={this.props.framesData[id].position} 
                       size={this.props.framesData[id].size} 
                       frameH={this.frameH} 
                       frameW={this.frameW} 
                       radius={24} 
               isSelected={isSelected}
               initCallback={this.props.frameSetSize} 
               dragCallback={this.props.frameMoved}
               deleteCallback={this.props.frameRemoved}
               selectionCallback={this.selectionCallback}
               deselectionCallback={this.deselectionCallback}
               pseudolinkCallback={this.pseudolinkCallback}
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
      <div style={{height:'500px',width:'500px'}}>
        <Button style={{zIndex:99999,position:'absolute'}} onClick={()=>{console.log('button');  this.props.frameAdded('Example',{x:130,y:130})}}>Add frame</Button>
        {this.renderFramesFromProps()}
        {this.renderLinksFromProps()}
        
      </div>
    );
  };
}

// function printAtWordWrap( context:any , text:string, x:number, y:number, lineHeight:number, fitWidth:number)
// {
//     fitWidth = fitWidth || 0;
    
//     if (fitWidth <= 0)
//     {
//         context.fillText( text, x, y );
//         return;
//     }
//     var words = text.split(' ');
//     var currentLine = 0;
//     var idx = 1;
//     while (words.length > 0 && idx <= words.length)
//     {
//         var str = words.slice(0,idx).join(' ');
//         var w = context.measureText(str).width;
//         if ( w > fitWidth )
//         {
//             if (idx==1)
//             {
//                 idx=2;
//             }
//             context.fillText( words.slice(0,idx-1).join(' '), x, y + (lineHeight*currentLine) );
//             currentLine++;
//             words = words.splice(idx-1);
//             idx = 1;
//         }
//         else
//         {idx++;}
//     }
//     if  (idx > 0)
//         context.fillText( words.join(' '), x, y + (lineHeight*currentLine) );
//     return currentLine;
// }
// function Frame(x:number,y:number,label:string){
//   var margin = 16;
//   var textSize = 18;
//   function draw(ctx:any,callback:any,id:number){
//     var contentSize = {x:0,y:0};
//     ctx.strokeStyle = '#000000';
//     ctx.beginPath();

//     contentSize.y = ((printAtWordWrap(ctx,label,x,y,textSize,150) as number)+1)*18+margin;
//     contentSize.x = 150+margin;

//     ctx.strokeRect(x-margin/2, y-textSize-margin/4, contentSize.x, contentSize.y);
//     callback(id,contentSize);
//   }
//   return(draw);
// }
// function Link(props:{x1:number,y1:number,x2:number,y2:number,w1:number,h1:number,w2:number,h2:number}){
//   return(
//       <svg style={{position:'absolute',overflow:'visible',zIndex:9999}}>
//         <line x1={props.x1} y1={props.y1} x2={props.x2} y2={props.y2} onClick={()=>console.log('hi')} style={{
//           stroke:'red',
//           strokeWidth:1,
//           cursor:'pointer'
//         }}>
//         </line>
//       </svg>
//   );
// }
// class App extends React.Component<any>{
//   canvasRef:any;
//   constructor(props:any) {
//     super(props);
//     this.canvasRef = React.createRef();
//   }
//   drawFrames(){
//     const canvas = this.canvasRef.current;
//     const ctx = (canvas as any)!.getContext('2d');
//     ctx.canvas.width  = window.innerWidth;
//     ctx.canvas.height = window.innerHeight;
//     ctx.font = '18px serif';

//     this.props.frames.forEach((frame:FrameType)=>{
//       var draw = Frame(frame.position.x,frame.position.y,frame.label);
//       draw(ctx,this.props.frameSetSize,frame.id);
//     });
//   }
//   drawLinks(){
//     var links = [] as JSX.Element[];
//     this.props.links.forEach((link:LinkType)=>{
//       var x1 = this.props.frames.at(link.frame1).position.x;
//       var y1 = this.props.frames.at(link.frame1).position.y;
//       var x2 = this.props.frames.at(link.frame2).position.x;
//       var y2 = this.props.frames.at(link.frame2).position.y;

//       var w1 = this.props.frames.at(link.frame1).size.x;
//       var h1 = this.props.frames.at(link.frame1).size.y;
//       var w2 = this.props.frames.at(link.frame2).size.x;
//       var h2 = this.props.frames.at(link.frame2).size.y;
//       links.push(<Link x1={x1} y1={y1} x2={x2} y2={y2} w1={w1} h1={h1} w2={w2} h2={h2}/>);
//     });
//     return(links);
//   }
//   componentDidMount(){
//     this.drawLinks();
//     this.drawFrames();
//   }
//   conponentDidUpdate(prevProps:any){
//     if(prevProps!==this.props){
//       this.drawFrames();
//     }
//   }
//   render(){
//     return(
//     <div>
//       <canvas ref={this.canvasRef} style={{position:'absolute'}}/>
//       {this.drawLinks()}
//     </div>
//     );
//   }
// }
const App_w = connect(mapState, mapDispatch)(App);
export default App_w;
