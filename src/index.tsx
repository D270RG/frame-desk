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
  render(){
    return(
      <div>
        {this.state.popupView && <Popup label='Enter label' externalStateAction={this.popupExternalAction}/>}
        <div className='navBar'>
          <div style={{width:'50%',height:'100%',marginTop:'12px',marginLeft:'5px',display:'flex',flexDirection:'row'}}>
            <div className='logo' style={{display: 'inline-block',fontSize:'30px'}}>
              Frame Desk
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
                      this.props.zoomIn(); //zoomIn
                    }}>
                <i className="bi bi-zoom-in"></i>
            </button>
            <button className='navButton'
                    style={{
                      fontSize:'25px'
                    }} 
                    onClick={()=>{
                      this.props.zoomOut();//zoom out
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
const Interface_w = applyConnectors(Interface,[framesDispatchConnector,zoomDispatchConnector]);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Interface_w/>   
    </Provider>
  </React.StrictMode>
);