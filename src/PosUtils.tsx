import { FrameElement, Position } from "./app/interfaces";

function posOp(a:Position,operation:string,b:Position){
    var newPos:Position = {x:0,y:0};
    switch(operation){
      case '+':{
        newPos = {x:a.x+b.x,y:a.y+b.y};
        break;
      }
      case '-':{
        newPos = {x:a.x-b.x,y:a.y-b.y};
        break;
      }
      case '*':{
        newPos = {x:a.x*b.x,y:a.y*b.y};
        break;
      }
      case '/':{
        newPos = {x:a.x/b.x,y:a.y/b.y};
      }
    }
    return(newPos);
  }
  function posShift(obj:FrameElement,shift:Position){
    return({...obj,
      position: posOp(obj.position,'+',shift)
    });
  }
  export {posOp,posShift}