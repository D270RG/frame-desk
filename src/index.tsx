import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactDOM from 'react-dom';
import {Navbar,Form,NavDropdown,Button} from 'react-bootstrap';
import {ConnectedProps} from 'react-redux'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import {ChevronDown} from 'react-bootstrap-icons'
import App_w from './App';
import './index.css';

import store from './app/store'
import { Provider } from 'react-redux';
import {framesDispatchConnector,applyConnectors} from './app/mappers';
import {connect} from 'react-redux';
import {Popup} from './modals';
import type {popupProps} from './modals'

const root = createRoot(document.getElementById('root') as HTMLElement);

interface InterfaceProps extends ConnectedProps<typeof framesDispatchConnector>{}
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
        {this.state.popupView && <Popup label='Enter image URL' externalStateAction={this.popupExternalAction}/>}
        <div className='navBar'>
          <div style={{fontFamily:'Joystix',color:'white',fontSize:'100%'}}>Logo</div>
          <Button style={{zIndex:999,width:'10%',height:'100%',margin:'0px',padding:'0px',borderRadius:'0px',fontSize:'3vh'}} 
                  onClick={()=>{this.setState({popupView:true})}}>Add</Button>
                  <Button style={{zIndex:999,width:'10%',height:'100%',margin:'0px',padding:'0px',borderRadius:'0px',fontSize:'3vh'}} 
                  onClick={()=>{
                    this.props.framesZoom(1.5);
                  }}>+</Button>
        </div>
      </div>
    );
  }
}
const Interface_w = applyConnectors(Interface,[framesDispatchConnector]);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Interface_w/>   
      <App_w/>
    </Provider>
  </React.StrictMode>
);