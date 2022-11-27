import React from 'react';
declare module 'csstype' {
    interface Properties {
      //allow any other property
      [index: string]: any;
    }
  }

  //---general static components----
  interface scalableContainerProps{
    onClick?:any,
    scalableStyle?:React.CSSProperties,
    style?:React.CSSProperties,
    children?:React.ReactNode,
    className?:string,
    id?:string,
    immutableStyles?:string[];
    passedRef?:React.Ref<any>;
    zoomMultiplier:number
  }
  class ScalableComponent<propsT,stateT> extends React.Component<propsT&scalableContainerProps,stateT>{
    constructor(props:propsT&scalableContainerProps){
      super(props);
    } 
    mapStyles=(stylesFromProps:React.CSSProperties|undefined)=>{
        var calculatedStyles = stylesFromProps;
        if(calculatedStyles!==undefined){
          for (let key in calculatedStyles) {
            var style:string|number = calculatedStyles[key];
            if(this.props.immutableStyles!==undefined){
              if(!this.props.immutableStyles.includes(key)){
                if(typeof(style)==='string'){
                  if(style.indexOf('px')!==-1){
                    calculatedStyles[key] = (parseFloat(style)*(this.props.zoomMultiplier)).toString()+'px';
                  }
                } else if(typeof(style)==='number'){
                  calculatedStyles[key] = (style*this.props.zoomMultiplier).toString()+'px';
                }
              }
            } else {
              if(typeof(style)==='string'){
                // if(style.indexOf('px')!==-1){
                //   calculatedStyles[key] = (parseFloat(style)*this.props.zoomMultiplier).toString()+'px';
                // }
              } else if(typeof(style)==='number'){
                calculatedStyles[key] = (style*this.props.zoomMultiplier).toString()+'px';
              }
            }
          }
        }
        return(calculatedStyles);
      }
  }

  //---Implementations---
  interface scalableDivProps{}

  class ScalableDiv extends ScalableComponent<scalableDivProps,{}>{
    constructor(props:scalableContainerProps&scalableDivProps){
      super(props);
    }
    render(){
      return(
        <div className={this.props.className} 
                draggable={false}
                id={this.props.id}
                onClick={this.props.onClick}
                ref={this.props.passedRef}
                style={this.mapStyles(this.props.style)}>
          {this.props.children}
        </div>
      );
    }
  }

  interface scalableButtonProps {
    ariaLabel?:string,
    title?:string
  }
  class ScalableButton extends ScalableComponent<scalableButtonProps,{}>{
    constructor(props:scalableContainerProps&scalableButtonProps){
      super(props);
    }
    render(){
      var calculatedStyles = this.mapStyles(this.props.style);
      return(
        <button className={this.props.className} 
                id={this.props.id}
                onClick={this.props.onClick}
                ref={this.props.passedRef}
                aria-label={this.props.ariaLabel}
                title={this.props.title}
                style={calculatedStyles}>
          {this.props.children}
        </button>
      );
    }
  }

  interface scalableImgProps extends scalableContainerProps{
    draggable?:boolean;
    onError?:(e:any)=>void;
    src:string;
  }
  class ScalableImg extends ScalableComponent<scalableImgProps,{}>{
    constructor(props:scalableContainerProps&scalableImgProps){
      super(props);
    }
    render(){
      var calculatedStyles = this.mapStyles(this.props.style);
      return(
        <img className={this.props.className}
            ref={this.props.passedRef} 
            draggable={this.props.draggable}
            style={calculatedStyles} 
            src={this.props.src}
            onError={this.props.onError}>
        </img>    
      );
    }
  }
  
  interface scalableSvgLineProps{
    x1:number,
    y1:number,
    x2:number,
    y2:number
  }
  class ScalableSvgLine extends ScalableComponent<scalableSvgLineProps,{}>{
    constructor(props:scalableContainerProps&scalableSvgLineProps){
      super(props);
    }
    render(){
      var calculatedStyles = this.mapStyles(this.props.style);
      return(
        <line ref={this.props.passedRef}
              x1={this.props.x1} y1={this.props.y1} 
              x2={this.props.x2} y2={this.props.y2} 
              style={calculatedStyles}
              id = {this.props.id}
              className={this.props.className}
        />
      );
    }
  }

  interface scalableTextareaProps{
    rows?:number,
    defaultValue?:string
  }
  class ScalableTextarea extends ScalableComponent<scalableTextareaProps,{}>{
    constructor(props:scalableTextareaProps&scalableContainerProps){
        super(props);
    }
    render(){
        var calculatedStyles = this.mapStyles(this.props.style);
        return(<textarea id={this.props.id}
                         className={this.props.className}
                         style={calculatedStyles} 
                         rows={this.props.rows} 
                         ref={this.props.passedRef} 
                         defaultValue={this.props.defaultValue}/>);
    }
  }
  export {ScalableButton,ScalableSvgLine,ScalableDiv,ScalableImg,ScalableTextarea}


