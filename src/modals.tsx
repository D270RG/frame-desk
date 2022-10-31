import React from 'react';
// interface popupProps extends ConnectedProps<typeof embedDispatchConnector>{
//     id:number,
//     externalStateAction: (arg0: boolean, arg1: any) => void
//   }
interface popupProps {
        id:number,
        label:string,
        externalStateAction: (activeValue: boolean, value:string) => void
      }
  class Popup extends React.Component<popupProps,{value:string}>{
    constructor(props:any){
      super(props);
      this.state = {value:''}
    }
    handleFormChange=(event:any)=>{
      this.setState({value: event.target.value});
    }
    handleFormSubmit=(event:any)=>{
      this.props.externalStateAction(false,this.state.value);
      event.preventDefault();
    }
    render(){
      return(
      <div>
        <div className='clickbox' style={{zIndex:999}} onClick={()=>{this.props.externalStateAction(false,this.state.value)}}/>
          <div className='embedPopup' style={{zIndex:1000}}>
              <form onSubmit={this.handleFormSubmit}>
                <label htmlFor='url'>{this.props.label}</label>
                <input type = 'text' name="url" onChange={this.handleFormChange}></input>
                <input type='submit' value='Submit'></input>
              </form>
          </div>
      </div>
      );
    }
  }
  export {Popup};
  export type {popupProps};