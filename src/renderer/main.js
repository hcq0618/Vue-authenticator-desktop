import Vue from 'vue'
import {
  Button, Row, Col, Card, Progress, Popover, Icon, Upload, MessageBox, Message, Image
} from 'element-ui'
import App from './App.vue'
Vue.config.productionTip = false
Vue.use(Button)
Vue.use(Row)
Vue.use(Col)
Vue.use(Card)
Vue.use(Progress)
Vue.use(Popover)
Vue.use(Icon)
Vue.use(Upload)
Vue.use(Image)

Vue.prototype.$msgbox = MessageBox
Vue.prototype.$alert = MessageBox.alert
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$prompt = MessageBox.prompt
Vue.prototype.$message = Message

/* eslint-disable no-new */
new Vue({
  components: { App },
  template: '<App/>'
}).$mount('#app')
