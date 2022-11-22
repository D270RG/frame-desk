import React from 'react';

interface popupProps {
        label:string,
        readOnly:boolean,
        initValue?:string,
        externalStateAction: (activeValue: boolean, value:string) => void
      }
  class TextareaPopup extends React.Component<popupProps>{
    constructor(props:popupProps){
      super(props);
    }
    textRef = React.createRef<any>();
    handleSubmit=()=>{
      this.props.externalStateAction(false,this.textRef.current.value);
    }
    render(){
      return(
      <div className='popupModal'>
        <div className='modalClickbox' onClick={()=>{this.props.externalStateAction(false,'');console.log('empty')}}/>
        <div className='modalTextareaWindow'>
          {this.props.label}
          <textarea className='textarea' rows={20} value={this.props.initValue} readOnly={this.props.readOnly} ref={this.textRef}/>
          <button className='modalSubmit' onClick={this.handleSubmit}>
            Submit
          </button>
        </div>
      </div>
      );
    }
  }
  class Popup extends React.Component<popupProps,{value:string}>{
    constructor(props:popupProps){
      super(props);
      this.state = {value:''}
    }
    textRef = React.createRef<any>();
    componentDidMount(){
      this.setState({value:this.textRef.current.value});
    };
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
            <input className='modalInput' ref={this.textRef} value={this.props.initValue} readOnly={this.props.readOnly} autoComplete='off' type = 'text' name="url" onChange={this.handleFormChange}></input>
            <input className='modalSubmit' type='submit' value='Submit'></input>
          </form>
        </div>
      </div>
      );
    }
  }
  export {Popup,TextareaPopup};
  export type {popupProps};