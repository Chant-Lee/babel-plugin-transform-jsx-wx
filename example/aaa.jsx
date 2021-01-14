
import {Component} from 'react'

const array = ['1', '2', '3'];

class Aaa extends Component {
  constructor(props){
    super(props);
    this.state = {}
 }

 onClick(){}
  render() {
    return <div>
      {this.state.flag && <Button>Click Me</Button>}
      
      {['a', 'b', 'c', 1, 2].map((item) => (<CusText>{item}</CusText>))}
      
      {array.map((item, index) => <Image key={index} lazyLoad>{item}</Image>)}      
    </div>
  }
}

function C() {
  return <div>
  {this.state.flag && <Button>Click Me</Button>}
  
  {['a', 'b', 'c', 1, 2].map((item) => (<CusText>{item}</CusText>))}
  
  {array.map((item, index) => <Image key={index} lazyLoad>{item}</Image>)}      
</div>
}