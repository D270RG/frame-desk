import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactDOM from 'react-dom';
import {ConnectedProps} from 'react-redux'
import App_w from './App';
import './index.css';

import store from './app/store'
import { Provider } from 'react-redux';
import {framesDispatchConnector,applyConnectors} from './app/mappers';
import {connect} from 'react-redux';
import {Popup,CButton} from './reusableComponents';

const root = createRoot(document.getElementById('root') as HTMLElement);

interface InterfaceProps extends ConnectedProps<typeof framesDispatchConnector>{}
class Interface extends React.Component<InterfaceProps,{popupView:boolean,zoomMultiplier:number}>{
  constructor(props:InterfaceProps){
    super(props);
    this.state = {popupView:false,zoomMultiplier:1.0}
  }
  popupExternalAction=(isVisible:boolean,value:string)=>{
    this.setState({popupView:isVisible});
    if(value!==''){
      this.props.frameAdded(value,null,{x:500,y:500});
    }
  }
  render(){
    return(
      <div>
        {this.state.popupView && <Popup label='Enter image URL' externalStateAction={this.popupExternalAction}/>}
        <div className='navBar'>
          <div style={{fontFamily:'Joystix',color:'white',fontSize:'100%'}}>Logo</div>
          <button className='holoButton' style={{zIndex:999,width:'10%',height:'100%',margin:'0px',padding:'0px',borderRadius:'0px',fontSize:'3vh'}} 
                  onClick={()=>{this.setState({popupView:true})}}>
              Add
          </button>
          <button className='holoButton' style={{zIndex:999,width:'10%',height:'100%',margin:'0px',padding:'0px',borderRadius:'0px',fontSize:'3vh'}} 
                  onClick={()=>{
                    this.setState({zoomMultiplier:(this.state.zoomMultiplier+0.1)});
                  }}>
              +
          </button>
          <button className='holoButton' style={{zIndex:999,width:'10%',height:'100%',margin:'0px',padding:'0px',borderRadius:'0px',fontSize:'3vh'}} 
                  onClick={()=>{
                    this.setState({zoomMultiplier:(this.state.zoomMultiplier-0.1)});
                  }}>
              -
          </button>
        </div>
        <App_w zoomMultiplier={this.state.zoomMultiplier}/>
      </div>
    );
  }
}
const Interface_w = applyConnectors(Interface,[framesDispatchConnector]);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Interface_w/>   
    </Provider>
  </React.StrictMode>
);