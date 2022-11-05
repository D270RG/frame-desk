import React from 'react';
interface popupProps {
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
      <div className='popupModal'>
        <div className='modalClickbox' onClick={()=>{this.props.externalStateAction(false,this.state.value)}}/>
        <div className='modalWindow'>
          <form className='modalForm' onSubmit={this.handleFormSubmit}>
            <label className='modalLabel' htmlFor='url'>{this.props.label}</label>
            <input className='modalInput' autoComplete='off' type = 'text' name="url" onChange={this.handleFormChange}></input>
            <input className='modalSubmit' type='submit' value='Submit'></input>
          </form>
        </div>
      </div>
      );
    }
  }
  export {Popup};
  export type {popupProps};