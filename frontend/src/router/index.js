import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Upload from '../pages/Upload.vue'
import Result from '../pages/Result.vue'
import Profile from '../pages/Profile.vue'
import History from '../pages/History.vue'
import Realtime from '../pages/Realtime.vue'
import StandardActions from '../pages/StandardActions.vue'
import ActionCompare from '../pages/ActionCompare.vue'
import Login from '../pages/Login.vue'
import Analysis from '../pages/Analysis.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/upload', name: 'Upload', component: Upload },
  { path: '/realtime', name: 'Realtime', component: Realtime },
  { path: '/result', name: 'Result', component: Result },
  { path: '/history', name: 'History', component: History },
  { path: '/analysis', name: 'Analysis', component: Analysis },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/actions', name: 'StandardActions', component: StandardActions },
  { path: '/compare', name: 'ActionCompare', component: ActionCompare }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
