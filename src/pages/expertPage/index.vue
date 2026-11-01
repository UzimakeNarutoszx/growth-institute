<template>
  <view class="page-container">
    <NavBar title="豆包AI答疑" :showBack="true" />

    <!-- 聊天消息区域 -->
    <scroll-view
      scroll-y
      class="chat-area"
      :scroll-into-view="scrollToId"
      :scroll-with-animation="true"
    >
      <!-- 欢迎消息 -->
      <view class="welcome-card mx-lg mt-md">
        <view class="welcome-avatar">
          <text class="welcome-emoji">🤖</text>
        </view>
        <text class="welcome-title">生长研究院 · 豆包AI助手</text>
        <text class="welcome-desc">我是基于豆包AI的智能答疑助手，专注儿童生长发育领域。您可以向我咨询营养、运动、睡眠等相关问题。</text>
      </view>

      <!-- 快捷问题 -->
      <view v-if="messages.length === 0" class="quick-questions mx-lg mt-md">
        <text class="quick-title">常见问题，点击快速提问：</text>
        <view class="quick-list mt-sm">
          <view
            v-for="(q, index) in quickQuestions"
            :key="index"
            class="quick-item clickable"
            @tap="sendQuickQuestion(q)"
          >
            <text class="quick-text">{{ q }}</text>
          </view>
        </view>
      </view>

      <!-- 聊天记录 -->
      <view class="messages-list mx-lg">
        <view
          v-for="(msg, index) in messages"
          :key="index"
          :id="'msg-' + index"
          class="message-item"
          :class="{ 'message-user': msg.role === 'user', 'message-ai': msg.role === 'assistant' }"
        >
          <view v-if="msg.role === 'assistant'" class="ai-avatar">
            <text class="ai-avatar-text">🤖</text>
          </view>
          <view class="message-bubble" :class="{ 'bubble-user': msg.role === 'user', 'bubble-ai': msg.role === 'assistant' }">
            <text class="message-text">{{ msg.content }}</text>
          </view>
        </view>

        <!-- 加载中 -->
        <view v-if="isLoading" class="message-item message-ai" id="msg-loading">
          <view class="ai-avatar">
            <text class="ai-avatar-text">🤖</text>
          </view>
          <view class="message-bubble bubble-ai">
            <view class="typing-wrap">
              <view class="typing-indicator">
                <view class="typing-dot" />
                <view class="typing-dot" />
                <view class="typing-dot" />
              </view>
              <text class="typing-time">豆包AI思考中 {{ thinkingSeconds }}s</text>
            </view>
          </view>
        </view>
      </view>

      <view style="height: 40rpx;" />
    </scroll-view>

    <!-- 底部输入区 -->
    <view class="input-bar safe-bottom">
      <view class="input-wrap">
        <input
          class="chat-input"
          v-model="inputText"
          placeholder="输入您的问题..."
          placeholder-class="input-placeholder"
          :disabled="isLoading"
          confirm-type="send"
          @confirm="sendMessage"
        />
      </view>
      <view
        class="send-btn clickable"
        :class="{ 'send-disabled': !inputText.trim() || isLoading }"
        @tap="sendMessage"
      >
        <text class="send-text">发送</text>
      </view>
    </view>

    <!-- 免责声明 -->
    <view class="disclaimer-float" v-if="messages.length === 0">
      <text class="disclaimer-text">⚠️ 豆包AI回答仅供参考，不能替代专业医疗诊断</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import NavBar from '@/components/NavBar.vue'

const API_BASE = 'http://localhost:3000'

const inputText = ref('')
const isLoading = ref(false)
const scrollToId = ref('')
const thinkingSeconds = ref(0)
let thinkingTimer: ReturnType<typeof setInterval> | null = null

function startThinkingTimer() {
  thinkingSeconds.value = 0
  thinkingTimer = setInterval(() => {
    thinkingSeconds.value++
  }, 1000)
}

function stopThinkingTimer() {
  if (thinkingTimer) {
    clearInterval(thinkingTimer)
    thinkingTimer = null
  }
  thinkingSeconds.value = 0
}

onUnmounted(() => {
  stopThinkingTimer()
})

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const messages = ref<ChatMessage[]>([])

const quickQuestions = [
  '孩子挑食不爱吃饭怎么办？',
  '什么运动最有助于长高？',
  '孩子几点睡觉最利于生长？',
  '骨龄偏小1岁需要担心吗？',
  '生长痛需要补钙吗？',
  '维生素D每天补多少合适？'
]

const SYSTEM_PROMPT = `你是"生长研究院"App的豆包AI健康助手，你的名字叫"豆包"，专注于3-19岁儿童及青少年的生长发育领域。

【你的角色设定】
你是一位专业、温暖、值得信赖的儿童生长发育顾问。你拥有丰富的营养学、运动医学和儿科知识。你说话简洁易懂，善于用数据和科学依据支持你的建议，同时保持亲切友好的语气。你完全理解本APP的"优化版（3-19岁）儿童&青少年长高测评"结构化体系。

【回答规则】
1. 回答简洁明了，分点列出重点，每次回复控制在300字以内
2. 涉及疾病诊断或用药建议时，提醒用户咨询专业医生
3. 给出的建议要按年龄段区分（3-6岁、7-9岁、10-19岁），并引用具体数值标准
4. 推荐补剂时说明剂量、科学依据、注意事项和禁忌
5. 语气亲切友好，称呼用户为"家长"
6. 当用户提供孩子信息时，主动计算遗传靶身高、BMI等关键指标并给出解读

【一、前置基础信息采集表（B001-B010）】
- B001 孩子姓名（文本，可选填）：仅用于APP内记录
- B002 孩子出生年月日（日期，精确到日）：计算精准年龄（精确到月）、近6个月增长速度
- B003 孩子性别（男/女，必选）：结合性别差异调整生长标准（女孩青春期发育早，营养需求峰值提前）
- B004 父亲身高cm（数值保留1位小数，必选）：计算遗传靶身高
- B005 母亲身高cm（数值保留1位小数，必选）：计算遗传靶身高
- B006 孩子当前身高cm（数值保留1位小数，必选，建议晨起空腹精确测量）：结合出生年月日计算近6个月/1年增长速度，评估生长迟缓程度
- B007 孩子当前体重kg（数值保留1位小数，必选）：计算BMI，判断营养过剩/不足，避免补剂推荐与体重状态冲突（如肥胖需控制钙摄入）
- B008 骨龄检测结果岁（数值保留1位小数，可选，无结果标注"未检测"）：评估生长潜力（骨龄落后/超前影响补剂优先级，骨龄落后1年以上优先补蛋白质+锌）
- B009 期望孩子成年身高cm（数值，必选）：结合遗传靶身高、生长速度，判断期望是否合理，避免过度推荐补剂
- B010 过敏史（多选：牛奶/大豆/坚果/无，必选）：补剂筛选（如牛奶过敏屏蔽乳清蛋白S001、乳钙S003）

【二、遗传靶身高计算逻辑】
- 男孩：（父亲身高 + 母亲身高 + 13）÷ 2 ± 6.5cm
- 女孩：（父亲身高 + 母亲身高 - 13）÷ 2 ± 6.5cm
- 中间值为理论成年身高，±6.5cm为正常波动范围
- 若期望身高超出波动范围，需结合骨龄判断是否有实现可能（骨龄落后者更有潜力）

【三、试题信息总表（T001-T015）及计分与补剂关联】

T001 饮食摄入-蛋白质：孩子每天摄入优质蛋白（鸡蛋、牛奶、瘦肉、鱼虾、豆制品）的情况？
  A(0分): 3种及以上，总量达标（3-6岁≥25g，7-9岁≥35g，10-19岁≥50g）
  B(1分): 1-2种，总量不足（3-6岁＜20g，7-9岁＜28g，10-19岁＜40g）
  C(2分): 几乎不摄入，长期挑食拒食
  → 关联补剂：S001

T002 饮食摄入-奶制品：孩子每天喝奶制品（牛奶、酸奶、奶酪）的情况？
  A(0分): 规律饮用（3-6岁250ml，7-9岁375ml，10-19岁500ml）
  B(1分): 偶尔喝，每周≤3次，每次＜200ml
  C(2分): 不喝或严重抗拒奶制品
  → 关联补剂：S003、S002

T003 饮食摄入-维生素A：孩子每天吃深绿色蔬菜、胡萝卜、南瓜等富含维生素A食物情况？
  A(0分): 每天都吃，摄入量充足（3-6岁≥100g，7-19岁≥150g）
  B(1分): 每周3-4次，摄入量一般
  C(2分): 很少吃，每周＜2次
  → 关联补剂：S005

T004 饮食摄入-锌：孩子每天吃富含锌的食物（牛肉、牡蛎、坚果）的情况？
  A(0分): 规律摄入（3-6岁每周≥4次，7-19岁每周≥5次）
  B(1分): 每周1-3次，偶尔摄入
  C(2分): 几乎不吃，长期缺乏
  → 关联补剂：S004

T005 生活习惯-户外活动：孩子每天户外活动（晒太阳、运动）的时间？
  A(0分): 充足接触阳光（3-6岁≥1小时，7-9岁≥1.2小时，10-19岁≥1.5小时）
  B(1分): 0.5-1小时，阳光接触较少
  C(2分): ＜0.5小时，几乎不晒太阳
  → 关联补剂：S002

T006 生活习惯-饮食行为：孩子是否有挑食、偏食、食欲差的表现？
  A(0分): 无，饮食均衡不挑食
  B(1分): 偶尔挑食，对部分食物抗拒
  C(2分): 长期严重挑食，很多食物不吃，食欲明显不佳
  → 关联补剂：S004

T007 身体症状-骨骼：孩子是否经常出现腿抽筋、关节酸痛（非运动损伤）？
  A(0分): 几乎没有，偶尔运动后轻微不适
  B(1分): 每月1-2次，无其他异常
  C(2分): 每周≥1次，频繁发作（10-19岁需区分生长痛与钙缺乏）
  → 关联补剂：S003

T008 身体症状-营养缺乏：孩子是否有皮肤粗糙、头发干枯、指甲有白线的情况？
  A(0分): 无，皮肤头发状态良好
  B(1分): 偶尔出现，不明显
  C(2分): 长期存在，症状明显
  → 关联补剂：S005

T009 身体症状-免疫力：孩子是否经常感冒、免疫力低下（每月生病≥2次）？
  A(0分): 很少生病，免疫力良好
  B(1分): 偶尔生病，1-2个月1次
  C(2分): 频繁生病，免疫力明显不足
  → 关联补剂：S004、S005

T010 生长发育-身高增长：孩子近6个月身高增长情况？
  参考标准：3-6岁≥3cm，7-9岁≥2.5cm，10-12岁≥4cm，13-15岁≥3cm，16-19岁≥1cm
  A(0分): 达标，增长速度正常
  B(1分): 略低
  C(2分): 明显落后
  → 关联补剂：所有补剂（综合判断）

T011 生长发育-BMI状态：孩子当前BMI是否在对应年龄性别正常范围（参考中国7岁以下/7-18岁儿童BMI标准）？
  A(0分): 正常（BMI 5%-85%百分位）→ 无补剂关联
  B(1分): 偏低（BMI＜5%百分位，营养不良风险）→ S001、S004
  C(2分): 偏高（BMI＞85%百分位，肥胖风险）→ 需控制热量，不推荐补剂

T012 骨龄相关：若已测骨龄，骨龄与实际年龄差值？
  A(0分): 骨龄≈实际年龄（差值±0.5岁）
  B(1分): 骨龄落后0.5-1岁 → S001、S004
  C(2分): 骨龄落后＞1岁或超前＞1岁 → S001、S004、S002

T013 睡眠习惯：孩子每天睡眠时间是否达标？
  标准：3-6岁≥10小时，7-9岁≥9小时，10-19岁≥8小时
  A(0分): 达标，规律作息 → 辅助生长激素分泌，无补剂关联
  B(1分): 略不足（差1小时以内）
  C(2分): 严重不足（差1小时以上）

T014 遗传潜力：家长是否有身高增长较晚的家族史？
  A(0分): 无
  B(1分): 有（1方家长）→ 仅参考，不影响补剂
  C(2分): 有（双方家长）

T015 期望身高匹配：期望成年身高与遗传靶身高差值？
  A(0分): 差值≤2cm（期望合理）
  B(1分): 差值2-5cm（期望略高，需优化生长）→ 所有补剂优先推荐
  C(2分): 差值＞5cm（期望过高）→ 建议骨龄检测后再推荐

【四、单一补剂基础信息表（S001-S005）】

S001 乳清蛋白粉（单一蛋白）：
  适用年龄：3-19岁
  剂量：3-6岁5-10g，7-9岁10-12g，10-19岁20-30g
  类型：蛋白质补剂
  核心作用：补充成骨细胞原料，支持骨骼框架合成
  对应营养缺口：蛋白质摄入不足、生长迟缓、BMI偏低
  关联试题：T001、T010、T011、T012
  关联基础信息条件：骨龄落后≥0.5岁 OR 近6个月身高增长＜达标值 OR BMI＜5%百分位
  禁忌：BMI＞85%百分位（肥胖）OR 牛奶蛋白过敏

S002 维生素D3制剂：
  适用年龄：3-19岁
  剂量：3-9岁400-600IU，10-19岁800-1000IU
  类型：维生素补剂
  核心作用：激活钙结合蛋白，提升钙利用率
  对应营养缺口：维生素D缺乏、阳光接触少
  关联试题：T002、T005、T012
  关联基础信息条件：每天户外活动＜1小时 OR 不喝奶制品 OR 骨龄落后＞1岁
  禁忌：维生素D过量史（血清25-OH-VD＞150nmol/L）

S003 乳钙（单一钙制剂）：
  适用年龄：3-19岁
  剂量：3-6岁300-400mg，7-9岁600-800mg，10-19岁1200-1500mg
  类型：矿物质补剂
  核心作用：骨骼主要成分，积累峰值骨量
  对应营养缺口：钙摄入不足、骨骼症状
  关联试题：T002、T007、T010
  关联基础信息条件：奶制品摄入不足 OR 频繁腿抽筋 OR 近6个月身高增长＜达标值
  禁忌：高钙尿症 OR 肾结石病史

S004 葡萄糖酸锌（单一锌）：
  适用年龄：3-19岁
  剂量：3-6岁4-6mg，7-9岁7-9mg，10-19岁12-15mg（锌元素）
  类型：矿物质补剂
  核心作用：促进生长激素分泌，改善食欲
  对应营养缺口：锌摄入不足、挑食、免疫力低
  关联试题：T004、T006、T009、T012
  关联基础信息条件：挑食偏食 OR 免疫力低下 OR 骨龄落后≥0.5岁
  禁忌：锌过量史（血清锌＞20μmol/L）OR 坚果过敏

S005 维生素A制剂：
  适用年龄：3-19岁
  剂量：3-6岁400μg，7-9岁500μg，10-19岁600-800μg（视黄醇）
  类型：维生素补剂
  核心作用：促进骨骺软骨增殖，增强免疫力
  对应营养缺口：维生素A摄入不足、营养缺乏症状
  关联试题：T003、T008、T009
  关联基础信息条件：富含维生素A食物摄入少 OR 皮肤粗糙/头发干枯 OR 免疫力低下
  禁忌：维生素A过量史（血清视黄醇＞5.1μmol/L）

【五、补剂触发规则对照表（基础信息+试题得分联合触发）】

S001触发：（骨龄落后≥0.5岁 OR BMI＜5% OR 近6个月增长＜达标值）+ T001+T010+T011得分≥3 → 优先级1（生长迟缓优先）
S002触发：（户外活动＜1小时 OR 不喝奶制品）+ T002+T005得分≥3 → 优先级2（钙吸收必备）
S003触发：（奶制品不足 OR 频繁腿抽筋）+ T002+T007得分≥3 → 优先级2（骨骼症状优先）
S004触发：（挑食 OR 免疫力低 OR 骨龄落后≥0.5岁）+ T004+T006+T009得分≥3 → 优先级1（生长激素激活）
S005触发：（维生素A食物摄入少 OR 皮肤症状 OR 免疫力低）+ T003+T008+T009得分≥3 → 优先级3（辅助生长）

【六、复配组合规则对照表（协同推荐）】

F001 钙(S003)+VD3(S002)：
  触发：（奶制品不足 OR 腿抽筋）+（户外活动＜1小时）+ T002+T005+T007得分≥4
  优势：VD3提升钙吸收率300%，满足青春期骨量积累需求
  禁忌：高钙尿症 OR 维生素D过量史

F002 蛋白质(S001)+锌(S004)：
  触发：（骨龄落后≥0.5岁 OR BMI＜5%）+（挑食 OR 生长迟缓）+ T001+T004+T010+T012得分≥4
  优势：锌激活生长激素+蛋白质提供骨骼原料，协同促进生长速度提升18%-25%
  禁忌：肥胖 OR 牛奶蛋白过敏 OR 锌过量史

F003 锌(S004)+维生素A(S005)：
  触发：（免疫力低 OR 皮肤症状）+（挑食）+ T004+T008+T009得分≥4
  优势：锌+VA协同增强免疫力，改善营养缺乏症状，间接支持生长
  禁忌：锌过量史 OR 维生素A过量史

F004 蛋白质(S001)+钙(S003)+VD3(S002)：
  触发：（生长迟缓 OR 骨龄落后＞1岁）+（营养摄入不足）+ 3个补剂触发条件均满足
  优势：全面覆盖骨骼生长原料（蛋白+钙）+吸收促进剂（VD3），适配生长潜力不足人群
  禁忌：肥胖 OR 牛奶蛋白过敏 OR 高钙尿症

【七、技术对接核心逻辑（你应理解的数据流转）】
1. 用户先填写「基础信息采集表」→ 系统自动计算年龄、BMI、遗传靶身高
2. 展示适配年龄的「试题表」→ 答题后累计得分
3. 结合基础信息条件判断补剂触发 → 优先推荐复配组合（若满足）
4. 展示推荐结果（含剂量、科学依据）
5. 年龄通过出生年月日自动精确计算到月，试题选项自动匹配实际年龄
6. BMI自动评估：系统内置中国儿童青少年BMI标准库（7岁以下/7-18岁）
7. 未填写骨龄则不纳入触发条件；填写后提升骨龄相关补剂（S001、S004、S002）优先级
8. 过敏史屏蔽：牛奶过敏→屏蔽S001、S003；大豆过敏→屏蔽相关豆制品建议；坚果过敏→屏蔽S004
9. 结果页展示：基础信息摘要→生长潜力评估→补剂推荐→生活方式建议`

// 豆包 API 调用
async function callDoubaoAI(userMessage: string): Promise<string> {
  const apiKey = import.meta.env.VITE_AI_API_KEY || ''

  const chatHistory: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.value.filter(m => m.role !== 'system').slice(-10),
    { role: 'user', content: userMessage }
  ]

  try {
    const res = await new Promise<any>((resolve, reject) => {
      uni.request({
        url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        data: {
          model: 'doubao-seed-1-8-251228',
          messages: chatHistory
        },
        success: (response) => resolve(response),
        fail: (err) => reject(err)
      })
    })

    if (res.statusCode === 200 && res.data?.choices?.[0]?.message?.content) {
      return res.data.choices[0].message.content
    } else {
      console.error('豆包 API 错误:', res)
      return '抱歉，AI 服务暂时不可用，请稍后再试。'
    }
  } catch (error) {
    console.error('请求失败:', error)
    return '网络请求失败，请检查网络连接后重试。'
  }
}

function sendQuickQuestion(question: string) {
  inputText.value = question
  sendMessage()
}

/**
 * 保存聊天消息到后端
 */
function saveChatToBackend(role: string, content: string) {
  const token = uni.getStorageSync('auth_token')
  if (!token) return
  uni.request({
    url: `${API_BASE}/api/chat/save`,
    method: 'POST',
    header: { 'x-token': token },
    data: { role, content }
  })
}

/**
 * 从后端加载聊天历史
 */
function loadChatHistory() {
  const token = uni.getStorageSync('auth_token')
  if (!token) return
  uni.request({
    url: `${API_BASE}/api/chat/history`,
    method: 'GET',
    header: { 'x-token': token },
    success: (res: any) => {
      const result = res.data
      if (result.code === 0 && result.data && result.data.length > 0) {
        messages.value = result.data.map((m: any) => ({
          role: m.role,
          content: m.content
        }))
      }
    }
  })
}

onMounted(() => {
  loadChatHistory()
})

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  // 添加用户消息
  messages.value.push({ role: 'user', content: text })
  saveChatToBackend('user', text)
  inputText.value = ''
  isLoading.value = true
  startThinkingTimer()

  await nextTick()
  scrollToId.value = 'msg-loading'

  // 调用豆包AI
  const reply = await callDoubaoAI(text)

  // 添加 AI 回复
  stopThinkingTimer()
  messages.value.push({ role: 'assistant', content: reply })
  saveChatToBackend('assistant', reply)
  isLoading.value = false

  await nextTick()
  scrollToId.value = 'msg-' + (messages.value.length - 1)
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background: #F8FAFF;
  display: flex;
  flex-direction: column;
}

/* 聊天区域 */
.chat-area {
  flex: 1;
  padding-bottom: 160rpx;
}

/* 欢迎卡片 */
.welcome-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(74, 158, 255, 0.08);
  padding: 40rpx;
  text-align: center;
}

.welcome-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: linear-gradient(135deg, #E8F3FF, #D4ECFF);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20rpx;
}

.welcome-emoji {
  font-size: 64rpx;
}

.welcome-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  display: block;
}

.welcome-desc {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.6;
  margin-top: 16rpx;
  display: block;
}

/* 快捷问题 */
.quick-title {
  font-size: 26rpx;
  color: #999999;
}

.quick-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.quick-item {
  background: #FFFFFF;
  border: 1rpx solid #E8F3FF;
  border-radius: 24rpx;
  padding: 14rpx 28rpx;
  transition: all 0.2s;
}

.quick-item:active {
  background: #E8F3FF;
}

.quick-text {
  font-size: 26rpx;
  color: #4A9EFF;
}

/* 消息列表 */
.messages-list {
  margin-top: 24rpx;
}

.message-item {
  display: flex;
  margin-bottom: 24rpx;
  align-items: flex-start;
}

.message-user {
  justify-content: flex-end;
}

.message-ai {
  justify-content: flex-start;
}

.ai-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 32rpx;
  background: #E8F3FF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.ai-avatar-text {
  font-size: 36rpx;
}

.message-bubble {
  max-width: 75%;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  word-break: break-all;
}

.bubble-user {
  background: #4A9EFF;
  border-radius: 16rpx 4rpx 16rpx 16rpx;
}

.bubble-user .message-text {
  color: #FFFFFF;
}

.bubble-ai {
  background: #FFFFFF;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  border-radius: 4rpx 16rpx 16rpx 16rpx;
}

.bubble-ai .message-text {
  color: #333333;
}

.message-text {
  font-size: 28rpx;
  line-height: 1.7;
  white-space: pre-wrap;
}

/* 打字指示器 */
.typing-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8rpx;
}

.typing-indicator {
  display: flex;
  gap: 8rpx;
  padding: 8rpx 0;
}

.typing-time {
  font-size: 22rpx;
  color: #999999;
  margin-top: 2rpx;
}

.typing-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 6rpx;
  background: #CCCCCC;
  animation: typingBounce 1.2s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); background: #CCCCCC; }
  30% { transform: translateY(-8rpx); background: #4A9EFF; }
}

/* 底部输入栏 */
.input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #FFFFFF;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.04);
  gap: 16rpx;
}

.input-wrap {
  flex: 1;
  background: #F5F7FA;
  border-radius: 32rpx;
  padding: 0 24rpx;
}

.chat-input {
  height: 72rpx;
  font-size: 28rpx;
  color: #333333;
}

.send-btn {
  width: 120rpx;
  height: 72rpx;
  background: #4A9EFF;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.send-disabled {
  background: #CCCCCC;
}

.send-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 500;
}

/* 免责声明 */
.disclaimer-float {
  position: fixed;
  bottom: 130rpx;
  left: 32rpx;
  right: 32rpx;
  text-align: center;
}

.disclaimer-text {
  font-size: 22rpx;
  color: #999999;
}
</style>
