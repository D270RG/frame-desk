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

const root = createRoot(document.getElementById('root') as HTMLElement);

interface NavProps extends ConnectedProps<typeof framesDispatchConnector>{}
class Nav extends React.Component<NavProps,{}>{
  constructor(props:any){
    super(props);
  }
  render(): React.ReactNode {
    return(
      <Navbar className='bg-dark text-end m-0 p-0' style={{position:'absolute',zIndex:9999,height:'5vh',width:'100%'}}>
        <Button style={{zIndex:99999,width:'10%',height:'100%',margin:'0px',padding:'0px',borderRadius:'0px',fontSize:'3vh'}} onClick={()=>{this.props.frameAdded('Write something here!',null,{x:500,y:500})}}>Add</Button>
        <div style={{fontFamily:'Joystix',color:'white',fontSize:'5vh'}}>Logo</div>
      </Navbar>
    );
  }
}
const Nav_w = applyConnectors(Nav,[framesDispatchConnector])
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Nav_w>

      </Nav_w>
    
      <App_w/>
    </Provider>
  </React.StrictMode>
);