import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactDOM from 'react-dom';
import {ConnectedProps} from 'react-redux'
import App_w from './App';
import './index.css';

import store, { RootDispatch, RootState } from './app/store'
import { Provider } from 'react-redux';
import { EmbedData, OverlayEffectTypes, Position } from './app/interfaces';
import {elementsStateConnector,framesDispatchConnector,zoomDispatchConnector,applyConnectors, zoomStateConnector} from './app/mappers';
import {connect} from 'react-redux';
import {Popup} from './reusableComponents';
import { frameEditSlice, graphSlice, overlayEffectsSlice, zoomSlice } from './app/reducers';

const root = createRoot(document.getElementById('root') as HTMLElement);
function posOp(a:Position,operation:string,b:Position){
  var newPos:Position = {x:0,y:0};
  switch(operation){
    case '+':{
      newPos = {x:a.x+b.x,y:a.y+b.y};
      break;
    }
    case '-':{
      newPos = {x:a.x-b.x,y:a.y-b.y};
      break;
    }
    case '*':{
      newPos = {x:a.x*b.x,y:a.y*b.y};
    }
  }
  return(newPos);
}

function mapInterfaceState(state:RootState){
  return{
    framesData: state.graphReducer.frames!.data,
    framesKeys: state.graphReducer.frames!.keys,

    zoomMultiplier: state.zoomReducer.zoomMultiplier
  }
}
const mapInterfaceDispatch = (dispatch:RootDispatch) =>({
  frameAdded:(label:string,embedLink:EmbedData|null,position:Position,size?:Position)=>{dispatch(graphSlice.actions.frameAdded({label:label,embedLink:embedLink,position:position,size:size}))},
  frameMoved:(id:number,position:Position)=>{dispatch(graphSlice.actions.frameMoved({id:id,position:position}))},
  zoomIn:()=>{dispatch(zoomSlice.actions.zoomIn({}))},
  zoomOut:()=>{dispatch(zoomSlice.actions.zoomOut({}))}
});

var interfaceConnector = connect(mapInterfaceState,mapInterfaceDispatch);
interface InterfaceProps extends ConnectedProps<typeof interfaceConnector>{}
class Interface extends React.Component<InterfaceProps,{popupView:boolean,scrollbarsVisibility:boolean}>{
  constructor(props:InterfaceProps){
    super(props);
    this.state = {popupView:false,scrollbarsVisibility:true}
  }
  popupExternalAction=(isVisible:boolean,value:string)=>{
    this.setState({popupView:isVisible});
    if(value!==''){
      this.props.frameAdded(value,null,{x:500,y:500});
    }
  }
  zoomMovement(mode:string){
    console.log('zoomMovement');
    var coef = Math.sqrt(Math.pow(0.1,2)+Math.pow(0.1,2));
    this.props.framesKeys.forEach((id:number)=>{
      var pos = this.props.framesData[id].position;
      var center = {x:window.innerWidth/2,y:window.innerHeight/2};
      var delta = posOp(pos,'-',center);
      var distance = Math.sqrt(Math.pow(delta.x,2)+Math.pow(delta.y,2));
      var angle = Math.atan(delta.y/distance);
      // var change = {x:Math.cos(angle)*distance*coef,y:Math.sin(angle)*distance*coef}
      var change = {x:Math.abs(delta.x)*coef,y:Math.abs(delta.y)*coef};
      if(delta.x<0 && delta.y<0){
        change = posOp(change,'*',{x:-1,y:-1});
      }
      if(delta.x>0 && delta.y>0){
       //default
      }
      if(delta.x<0 && delta.y>0){
        change = posOp(change,'*',{x:-1,y:1});
      }
      if(delta.x>0 && delta.y<0){
        change = posOp(change,'*',{x:1,y:-1});
      }
      // if(delta.x<0 && delta.y<0){
      //   change = posOp(change,'*',{x:-1,y:1});
      // }
      // if(delta.x>0 && delta.y>0){
      //   change = posOp(change,'*',{x:1,y:1});
      // }
      // if(delta.x<0 && delta.y>0){
      //   change = posOp(change,'*',{x:-1,y:1});
      // }
      // if(delta.x>0 && delta.y<0){
      //   //default
      // }
      switch(mode){
        case 'in':{
          this.props.frameMoved(id,posOp(pos,'+',change));
          break;
        };
        case 'out':{
          this.props.frameMoved(id,posOp(pos,'-',change));
          break;
        }
      }
    })
  }
  render(){
    return(
      <div>
        {this.state.popupView && <Popup label='Enter label' externalStateAction={this.popupExternalAction}/>}
        <div className='navBar'>
          <div style={{width:'50%',height:'100%',marginTop:'12px',marginLeft:'5px',display:'flex',flexDirection:'row'}}>
            <div className='logo' style={{display: 'inline-block',fontSize:'30px'}}>
              FD
              </div>
          </div>
          <div style={{width:'50%',height:'100%',display:'flex',flexDirection:'row'}}>
            <button className='navButton'
                    style={{
                      fontSize:'20px'
                    }} 
                    onClick={()=>{this.setState({popupView:true})}}>
                <i className="bi bi-plus-square"></i>
            </button>
            <button className='navButton'
                    style={{
                      fontSize:'25px'
                    }}
                    onClick={()=>{
                      if(this.props.zoomMultiplier<1.5){
                        this.zoomMovement('in');
                        this.props.zoomIn();
                      }
                    }}>
                <i className="bi bi-zoom-in"></i>
            </button>
            <button className='navButton'
                    style={{
                      fontSize:'25px'
                    }} 
                    onClick={()=>{
                      if(this.props.zoomMultiplier>0.5){
                        this.zoomMovement('out');
                        this.props.zoomOut();//zoom out
                      }
                    }}>
                <i className="bi bi-zoom-out"></i>
            </button>
            <button className='navButton'
                    style={{
                      fontSize:'20px'
                    }} 
                    onClick={()=>{this.setState({scrollbarsVisibility:!this.state.scrollbarsVisibility})}}>
                <i className="bi bi-layout-sidebar-inset-reverse"></i>
            </button>
          </div> 
        </div>
        <App_w scrollbarsVisibility={this.state.scrollbarsVisibility}/>
      </div>
    );
  }
}
const Interface_w = interfaceConnector(Interface);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Interface_w/>   
    </Provider>
  </React.StrictMode>
);