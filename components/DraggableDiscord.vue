<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  discordUrl: string
}>()

const isDragging = ref(false)
const position = ref({ x: 24, y: 100 }) // Bottom right corner defaults (px from bottom/right)
const buttonRef = ref<HTMLElement | null>(null)

let startX = 0
let startY = 0
let initialX = 0
let initialY = 0

// 处理开始拖拽
function handlePointerDown(e: MouseEvent | TouchEvent) {
  // 如果点的是关闭按钮之类，不要拖拽（目前没关闭按钮）
  isDragging.value = true
  
  if (e.type === 'touchstart') {
    startX = (e as TouchEvent).touches[0].clientX
    startY = (e as TouchEvent).touches[0].clientY
  } else {
    startX = (e as MouseEvent).clientX
    startY = (e as MouseEvent).clientY
  }
  
  initialX = position.value.x
  initialY = position.value.y

  document.addEventListener('mousemove', handlePointerMove)
  document.addEventListener('mouseup', handlePointerUp)
  document.addEventListener('touchmove', handlePointerMove, { passive: false })
  document.addEventListener('touchend', handlePointerUp)
}

// 处理拖拽过程
function handlePointerMove(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  e.preventDefault() // 防止移动端滚动

  let clientX, clientY
  if (e.type === 'touchmove') {
    clientX = (e as TouchEvent).touches[0].clientX
    clientY = (e as TouchEvent).touches[0].clientY
  } else {
    clientX = (e as MouseEvent).clientX
    clientY = (e as MouseEvent).clientY
  }

  // 计算偏移量 (注意：因为我们用的是 right 和 bottom 定位，所以滑动方向是反的)
  const dx = startX - clientX
  const dy = startY - clientY

  // 计算新位置并限制在屏幕范围内
  const btnWidth = buttonRef.value?.offsetWidth || 60
  const btnHeight = buttonRef.value?.offsetHeight || 60
  const maxX = window.innerWidth - btnWidth
  const maxY = window.innerHeight - btnHeight

  let newX = initialX + dx
  let newY = initialY + dy

  // 边界约束
  newX = Math.max(0, Math.min(newX, maxX))
  newY = Math.max(0, Math.min(newY, maxY))

  position.value = { x: newX, y: newY }
}

// 处理拖拽结束
function handlePointerUp() {
  isDragging.value = false
  document.removeEventListener('mousemove', handlePointerMove)
  document.removeEventListener('mouseup', handlePointerUp)
  document.removeEventListener('touchmove', handlePointerMove)
  document.removeEventListener('touchend', handlePointerUp)
}

// 跳转处理
function handleClick(e: MouseEvent) {
  // 如果拖拽了超过一定距离，就不当做点击处理
  const dx = Math.abs(position.value.x - initialX)
  const dy = Math.abs(position.value.y - initialY)
  if (dx > 5 || dy > 5) {
    e.preventDefault()
  }
}
</script>

<template>
  <a
    ref="buttonRef"
    :href="discordUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="draggable-discord"
    :style="{ right: `${position.x}px`, bottom: `${position.y}px` }"
    @mousedown="handlePointerDown"
    @touchstart="handlePointerDown"
    @click="handleClick"
    title="Join our Discord Community"
  >
    <div class="discord-icon-wrapper">
      <svg viewBox="0 0 24 24" class="discord-svg" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.618-1.25.077.077 0 00-.079-.037 19.736 19.736 0 00-4.885 1.515.07.07 0 00-.032.028C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 01.078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.1.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.332-.946 2.418-2.157 2.418z"/></svg>
    </div>
    <!-- 提示气泡，悬浮时显示 -->
    <div class="discord-tooltip">
      遇到问题？来这里反馈
    </div>
  </a>
</template>

<style scoped>
.draggable-discord {
  position: fixed;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background-color: #5865F2;
  border-radius: 50%;
  color: white;
  cursor: grab;
  box-shadow: 0 4px 16px rgba(88, 101, 242, 0.4);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  user-select: none;
  touch-action: none;
}

.draggable-discord:active {
  cursor: grabbing;
  transform: scale(0.95);
}

.draggable-discord:hover {
  box-shadow: 0 6px 20px rgba(88, 101, 242, 0.6);
}

.discord-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.discord-svg {
  width: 30px;
  height: 30px;
}

/* 提示气泡 */
.discord-tooltip {
  position: absolute;
  right: 100%;
  margin-right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background-color: white;
  color: #000F49;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: opacity 0.2s ease, transform 0.2s ease;
  transform-origin: right center;
}

/* 气泡小箭头 */
.discord-tooltip::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -5px;
  transform: translateY(-50%);
  border-width: 6px 0 6px 6px;
  border-style: solid;
  border-color: transparent transparent transparent white;
}

.draggable-discord:hover .discord-tooltip {
  opacity: 1;
  transform: translateY(-50%) translateX(-4px);
}

/* 移动端隐藏提示气泡 */
@media (max-width: 768px) {
  .discord-tooltip {
    display: none;
  }
}
</style>