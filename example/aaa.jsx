
const array = ['1', '2', '3'];
const flag = true
function render() {
  return <View>
  {flag && <Button>Click Me</Button>}
  
  {['a', 'b', 'c', 1, 2].map((item) => (<CusText>{item}</CusText>))}
  
  {array.map((item, index) => <Image lazyLoad>{item}</Image>)}      
</View>
}
