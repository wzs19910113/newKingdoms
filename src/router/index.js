import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/Home'
import Battle from '@/pages/Battle'
import Start from '@/pages/Start'
import Test from '@/pages/Test'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/home',
            name: 'Home',
            component: Home
        },
        {
            path: '/battle',
            name: 'Battle',
            component: Battle
        },
        {
            path: '/',
            name: 'Start',
            component: Start
        },
        {
            path: '/test',
            name: 'Test',
            component: Test
        }
    ]
})
