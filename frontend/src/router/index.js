import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Upload from '../pages/Upload.vue'
import Result from '../pages/Result.vue'
import Profile from '../pages/Profile.vue'
import History from '../pages/History.vue'
import Realtime from '../pages/Realtime.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/upload', name: 'Upload', component: Upload },
  { path: '/realtime', name: 'Realtime', component: Realtime },
  { path: '/result', name: 'Result', component: Result },
  { path: '/history', name: 'History', component: History },
  { path: '/profile', name: 'Profile', component: Profile }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
