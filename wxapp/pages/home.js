import Page from '../wx'
import './home.css'

class Home extends Page {
  constructor(props) {
    this.state = {
      items: ['hello'],
      name: {
        a: 123,
      },
      arr: [],
    }
  }

  onClick() {
    console.log('test click')
    this.setState({
      arr: [
        [{ id: 3 }, { id: 4 }],
        [{ id: 3 }, { id: 4 }],
        [{ id: 3 }, { id: 4 }],
      ],
    })
  }
  render() {
    return (
      <div
        className="app"
        onClick={this.onClick}
        style={{ posistion: 'relative' }}
      >
        添加 arr 数组
        {this.state.arr.map(function (item, index) {
          return <div>{item2.id}</div>
        })}
      </div>
    )
  }
}
export default Home
