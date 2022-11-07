import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactDOM from 'react-dom';
import {ConnectedProps} from 'react-redux'
import App_w from './App';
import './index.css';

import store from './app/store'
import { Provider } from 'react-redux';
import {framesDispatchConnector,zoomDispatchConnector,applyConnectors} from './app/mappers';
import {connect} from 'react-redux';
import {Popup} from './reusableComponents';

const root = createRoot(document.getElementById('root') as HTMLElement);

interface InterfaceProps extends ConnectedProps<typeof framesDispatchConnector>,
                                 ConnectedProps<typeof zoomDispatchConnector>{}
class Interface extends React.Component<InterfaceProps,{popupView:boolean}>{
  constructor(props:InterfaceProps){
    super(props);
    this.state = {popupView:false}
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
        {this.state.popupView && <Popup label='Enter label' externalStateAction={this.popupExternalAction}/>}
        <div className='navBar'>
          <div style={{width:'50%',height:'100%',display:'flex',flexDirection:'row'}}>
            <div className='logo' style={{display: 'inline-block'}}>
              Logo
              </div>
          </div>
          <div style={{width:'50%',height:'100%',display:'flex',flexDirection:'row'}}>
            <button className='navButton'
                    onClick={()=>{this.setState({popupView:true})}}>
                Add
            </button>
            <button className='navButton'
                    onClick={()=>{
                      this.props.zoomIn(); //zoomIn
                    }}>
                +
            </button>
            <button className='navButton' style={{zIndex:999,width:'10%',height:'100%',margin:'0px',padding:'0px',borderRadius:'0px',fontSize:'3vh'}} 
                    onClick={()=>{
                      this.props.zoomOut();//zoom out
                    }}>
                -
            </button>
          </div> 
        </div>
        <App_w/>
      </div>
    );
  }
}
const Interface_w = applyConnectors(Interface,[framesDispatchConnector,zoomDispatchConnector]);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Interface_w/>   
    </Provider>
  </React.StrictMode>
);