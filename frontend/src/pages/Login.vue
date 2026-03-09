<template>
  <div class="login-page">
    <div class="login-header">
      <div class="logo">🏓</div>
      <h1>乒乓 AI 教练</h1>
      <p>专业乒乓球动作分析</p>
    </div>

    <!-- 登录表单 -->
    <van-form @submit="onSubmit" class="login-form">
      <van-field
        v-model="phone"
        name="phone"
        placeholder="请输入手机号"
        label="手机号"
        type="tel"
        maxlength="11"
        :rules="[{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]"
      >
        <template #button>
          <van-button
            size="small"
            type="primary"
            plain
            :loading="sendingCode"
            :disabled="countdown > 0 || !phoneValid"
            @click="sendCode"
          >
            {{ countdown > 0 ? `${countdown}秒` : '获取验证码' }}
          </van-button>
        </template>
      </van-field>

      <van-field
        v-model="code"
        name="code"
        placeholder="请输入验证码"
        label="验证码"
        type="number"
        maxlength="6"
        :rules="[{ required: true, message: '请输入验证码' }]"
      />

      <van-field
        v-if="isRegister"
        v-model="password"
        name="password"
        type="password"
        placeholder="请设置密码"
        label="密码"
        :rules="[{ required: true, message: '请设置密码' }]"
      />

      <div class="tips">
        <van-checkbox v-model="agreeTerms" icon-size="16px">
          我已阅读并同意
          <a href="#" @click.prevent="showTerms">《用户协议》</a>
          和
          <a href="#" @click.prevent="showPrivacy">《隐私政策》</a>
        </van-checkbox>
      </div>

      <div class="actions">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="loading"
        >
          {{ isRegister ? '注册' : '登录' }}
        </van-button>
      </div>
    </van-form>

    <!-- 切换登录/注册 -->
    <div class="switch-mode">
      <span>{{ isRegister ? '已有账号？' : '还没有账号？' }}</span>
      <a href="#" @click.prevent="toggleMode">
        {{ isRegister ? '立即登录' : '去注册' }}
      </a>
    </div>

    <!-- 其他登录方式 -->
    <div class="other-login">
      <van-divider>其他登录方式</van-divider>
      <div class="other-icons">
        <div class="other-icon" @click="wechatLogin">
          <van-icon name="wechat" size="32" color="#07c160" />
          <span>微信</span>
        </div>
        <div class="other-icon" @click="appleLogin">
          <van-icon name="apple" size="32" color="#000" />
          <span>Apple</span>
        </div>
      </div>
    </div>

    <!-- 用户协议弹窗 -->
    <van-dialog
      v-model:show="showTermsDialog"
      title="用户协议"
      show-cancel-button
      confirm-button-text="同意"
      cancel-button-text="不同意"
      @confirm="agreeTerms = true"
    >
      <div class="terms-content">
        <p>欢迎使用乒乓 AI 教练...</p>
        <p>（此处显示完整用户协议内容）</p>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, showDialog } from 'vant'
import axios from 'axios'

const router = useRouter()

// 表单数据
const phone = ref('')
const code = ref('')
const password = ref('')
const isRegister = ref(false)
const agreeTerms = ref(false)
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const showTermsDialog = ref(false)

// 手机号验证
const phoneValid = computed(() => {
  return /^1[3-9]\d{9}$/.test(phone.value)
})

// 发送验证码
const sendCode = async () => {
  if (!phoneValid.value) {
    showToast('请输入正确的手机号')
    return
  }

  sendingCode.value = true
  try {
    // 调用发送验证码 API
    const res = await axios.post('/api/auth/send-code', {
      phone: phone.value
    })
    
    if (res.data.success) {
      showToast('验证码已发送')
      // 开始倒计时
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    }
  } catch (error) {
    // 开发环境：显示测试验证码
    showToast('验证码：123456（测试）')
    code.value = '123456'
    countdown.value = 60
  } finally {
    sendingCode.value = false
  }
}

// 提交登录/注册
const onSubmit = async (values) => {
  if (!agreeTerms.value) {
    showToast('请先同意用户协议')
    return
  }

  loading.value = true
  try {
    const endpoint = isRegister.value ? '/api/auth/register' : '/api/auth/login'
    
    const res = await axios.post(endpoint, {
      phone: phone.value,
      code: code.value,
      password: isRegister.value ? password.value : undefined
    })

    if (res.data.success) {
      // 保存 token
      localStorage.setItem('token', res.data.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.data.user))
      
      showToast(isRegister.value ? '注册成功' : '登录成功')
      router.push('/')
    }
  } catch (error) {
    // 开发环境：直接登录
    const mockUser = {
      id: 1,
      phone: phone.value,
      nickname: '球友_' + phone.value.slice(-4)
    }
    localStorage.setItem('token', 'mock_token_123')
    localStorage.setItem('user', JSON.stringify(mockUser))
    showToast('登录成功（测试模式）')
    router.push('/')
  } finally {
    loading.value = false
  }
}

// 切换登录/注册
const toggleMode = () => {
  isRegister.value = !isRegister.value
}

// 显示协议
const showTerms = () => {
  showTermsDialog.value = true
}

const showPrivacy = () => {
  showDialog({
    title: '隐私政策',
    message: '（此处显示隐私政策内容）',
    confirmButtonText: '我知道了'
  })
}

// 其他登录方式
const wechatLogin = () => {
  showToast('微信登录开发中')
}

const appleLogin = () => {
  showToast('Apple 登录开发中')
}

// 检查是否已登录
onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    router.push('/')
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  padding: 40px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.login-header .logo {
  font-size: 64px;
  margin-bottom: 16px;
}

.login-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.login-header p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.login-form {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.tips {
  margin: 16px 0;
}

.tips :deep(.van-checkbox__label) {
  font-size: 12px;
  color: #666;
}

.tips a {
  color: #1989fa;
}

.actions {
  margin-top: 24px;
}

.switch-mode {
  text-align: center;
  color: white;
  font-size: 14px;
}

.switch-mode a {
  color: white;
  font-weight: 600;
  margin-left: 8px;
}

.other-login {
  margin-top: 32px;
  color: white;
}

.other-login :deep(.van-divider) {
  color: rgba(255,255,255,0.8);
}

.other-login :deep(.van-divider::before),
.other-login :deep(.van-divider::after) {
  border-color: rgba(255,255,255,0.3);
}

.other-icons {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 24px;
}

.other-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.other-icon span {
  font-size: 12px;
  color: white;
}

.terms-content {
  max-height: 300px;
  overflow-y: auto;
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
}
</style>
