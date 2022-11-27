import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactDOM from 'react-dom';
import {ConnectedProps,batch} from 'react-redux'
import App_w from './App';
import './index.css';

import store, { RootDispatch, RootState } from './app/store'
import { Provider } from 'react-redux';
import { EmbedData, FrameElement, FrameType, ImportData, LinkType, OverlayEffectTypes, Position } from './app/interfaces';
import {connect} from 'react-redux';
import {Popup, TextareaPopup} from './reusableComponents';
import { frameEditSlice, graphSlice, listenersStateSlice, overlayEffectsSlice, zoomSlice } from './app/reducers';

const root = createRoot(document.getElementById('root') as HTMLElement);
function mapInterfaceState(state:RootState){
  return{
    framesData: state.graphReducer.frames!.data,
    framesKeys: state.graphReducer.frames!.keys,
    links: state.graphReducer.links,

    zoomMultiplier: state.zoomReducer.zoomMultiplier
  }
}
const mapInterfaceDispatch = (dispatch:RootDispatch) =>({
  frameAdded:(label:string,embedLink:EmbedData|null,position:Position,size?:Position)=>{dispatch(graphSlice.actions.frameAdded({label:label,embedLink:embedLink,position:position,size:size}))},
  frameMoved:(id:number,position:Position)=>{dispatch(graphSlice.actions.frameMoved({id:id,position:position}))},
  zoomIn:()=>{dispatch(zoomSlice.actions.zoomIn({}))},
  zoomOut:()=>{dispatch(zoomSlice.actions.zoomOut({}))},
  setZoom:(zoomMultiplier:number)=>{dispatch(zoomSlice.actions.setZoom({zoomMultiplier:zoomMultiplier}))},
  setScrollState:(state:boolean)=>{dispatch(listenersStateSlice.actions.setState({state:state}))},
  importState:(dataToImport:ImportData)=>{  
      batch(()=>{
        dispatch(graphSlice.actions.importState({dataToImport:dataToImport}));
        dispatch(zoomSlice.actions.importZoom({dataToImport:dataToImport}));
      }); 
  },
  setZoomMode:(zoomMode:boolean|null)=>{
    dispatch(zoomSlice.actions.setZoomMode({zoomMode:zoomMode}));
  }
});

var interfaceConnector = connect(mapInterfaceState,mapInterfaceDispatch);
interface InterfaceProps extends ConnectedProps<typeof interfaceConnector>{}
class Interface extends React.Component<InterfaceProps,{frameAddPopupView:boolean,
                                                        exportPopupView:boolean,
                                                        importPopupView:boolean,
                                                        scrollbarsVisibility:boolean}>{
  appRef = React.createRef<any>();
  constructor(props:InterfaceProps){
    super(props);
    this.state = {frameAddPopupView:false,
                  importPopupView:false,
                  exportPopupView:false,
                  scrollbarsVisibility:true}
  }
  frameAddPopupExternalAction=(isVisible:boolean,value:string)=>{
    this.setState({frameAddPopupView:isVisible});
    if(value!==''){
      this.props.frameAdded(value,null,{x:500,y:500});
    }
  }
  importPopupExternalAction=(isVisible:boolean,value:string)=>{
    this.props.setScrollState(true); 
    if(value!==''){
      var dataToImport = JSON.parse(value);
      const isImportData = (data:any):data is ImportData => true;
      if(isImportData(dataToImport)){
        this.props.importState(dataToImport as ImportData);
      }
    }
    this.setState({importPopupView:isVisible});
  }
  exportPopupExternalAction=(isVisible:boolean,value:string)=>{
    this.props.setScrollState(true); 
    if(value !== ''){
      navigator.clipboard.writeText(value);
    }
    this.setState({exportPopupView:isVisible});
  }
  resetApp=()=>{
    this.props.setZoom(1.0);
    this.appRef.current.scrollTo(0,0);
  }
  render(){
    return(
      <div>
        {this.state.frameAddPopupView && <Popup readOnly={false} label='Enter label' externalStateAction={this.frameAddPopupExternalAction}/>}
        {this.state.importPopupView && <TextareaPopup readOnly={false}  label='Import' externalStateAction={this.importPopupExternalAction}/>}
        {this.state.exportPopupView && <TextareaPopup initValue={
                                                JSON.stringify(
                                                  {framesData:this.props.framesData,
                                                  framesKeys:this.props.framesKeys,
                                                  links:this.props.links,
                                                  zoomMultiplier:this.props.zoomMultiplier
                                                  }, null, 4)
                                              } readOnly={true} label='Export' externalStateAction={this.exportPopupExternalAction}/>}
        <div className='navBar'>
          <div style={{height:'100%',marginTop:'12px',marginLeft:'5px',display:'flex',flexDirection:'row'}}>
            <div className='logo' style={{display: 'inline-block',fontSize:'30px'}}>
              D
              </div>
          </div>
          <div style={{width:'95%',height:'100%',display:'flex',justifyContent:'center'}}>
            <button className='navButton'
                    style={{
                      fontSize:'20px'
                    }} 
                    title='Add frame'
                    aria-label='Add frame'
                    onClick={()=>{this.setState({frameAddPopupView:true})}}>
                <i className="bi bi-plus-square"></i>
            </button>
            <button className='navButton'
                    style={{
                      fontSize:'25px'
                    }}
                    title='Zoom in'
                    aria-label='Zoom in'
                    onClick={(e)=>{
                      if(this.props.zoomMultiplier<1.5){
                        this.props.setZoomMode(true);
                      }
                    }}>
                <i className="bi bi-zoom-in"></i>
            </button>
            <button className='navButton'
                    style={{
                      fontSize:'25px'
                    }} 
                    title='Zoom out'
                    aria-label='Zoom out'
                    onClick={()=>{
                      if(this.props.zoomMultiplier>0.5){
                        this.props.setZoomMode(false);

                      }
                    }}>
                <i className="bi bi-zoom-out"></i>
            </button>
            <button className='navButton'
                    style={{
                      fontSize:'25px'
                    }} 
                    title='Reset view'
                    aria-label='Reset view'
                    onClick={()=>{
                      this.resetApp();
                    }}>
                <i className="bi bi-arrow-clockwise"></i>
            </button>
            <button className='navButton'
                    style={{
                      fontSize:'20px'
                    }} 
                    title='Import'
                    aria-label='Import'
                    onClick={()=>{this.setState({importPopupView:true})}}>
                <i className="bi bi-download"></i>
            </button>
            <button className='navButton'
                    style={{
                      fontSize:'20px'
                    }} 
                    title='Export'
                    aria-label='Export'
                    onClick={()=>{this.props.setScrollState(false); 
                                  this.setState({exportPopupView:true})}}>
                <i className="bi bi-upload"></i>
            </button>
          </div> 
        </div>
        <App_w scrollbarsVisibility={this.state.scrollbarsVisibility} appRef={this.appRef}/>
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