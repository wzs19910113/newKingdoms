<template>
    <div class="toast-container">
        <TransitionGroup class="toast" name="toast" tag="div">
            <div v-for="toast in activeToasts" :key="toast.id" class="toast-message" @click.stop="manualClose(toast.id)" >
                <div class="message">{{ toast.message }}</div>
                <div class="message-bg"></div>
                <!-- <span class="toast-progress" :style="{ animationDuration: '5s' }"></span> -->
            </div>
        </TransitionGroup>
    </div>
</template>

<script>
export default {
  name: "Toast",
  data() {
    return {
      activeToasts: [],      // 当前活跃的提示列表
      triggerCount: 0,      // 已触发次数计数器
      pendingQueue: [],      // 待触发的队列（超出10次后暂存）
      isProcessingQueue: false,
    };
  },
  methods: {
    trigger(message = "这是一条提示信息", period = 1.5) {
      // 检查是否超过最大连续触发次数 (10次)
      if (this.triggerCount >= 10) {
        // 如果队列未满或允许排队，可以加入待处理队列（这里实现为可选排队）
        // 但根据需求“最多连续触发10次”，超出部分可以选择忽略或排队。
        // 为更好的用户体验，这里实现排队机制：超出10次的触发会等待前面提示消失后自动继续。
        // 如果不希望排队直接忽略，可修改为 return false。
        this.pendingQueue.push(message);
        this.processQueue();
        return false;
      }

      // 增加触发计数
      this.triggerCount++;

      // 生成唯一ID
      const id = Date.now() + Math.random() * 10000;
      const newToast = {
        id,
        message,
        timeoutId: null,
      };

      // 设置5秒后自动关闭
      const timeoutId = setTimeout(() => {
        this.closeToast(id);
    }, period*1000);

      newToast.timeoutId = timeoutId;
      this.activeToasts.push(newToast);

      return true;
    },
    manualClose(id) {
      this.closeToast(id);
    },
    closeToast(id) {
      const index = this.activeToasts.findIndex(toast => toast.id === id);
      if (index !== -1) {
        const toast = this.activeToasts[index];
        if (toast.timeoutId) {
          clearTimeout(toast.timeoutId);
        }
        this.activeToasts.splice(index, 1);
        // 每次关闭一个提示，减少连续触发计数
        this.triggerCount--;
        if (this.triggerCount < 0) this.triggerCount = 0;

        // 处理待处理队列
        this.processQueue();
      }
    },
    processQueue() {
      if (this.isProcessingQueue) return;
      if (this.pendingQueue.length > 0 && this.triggerCount < 10) {
        this.isProcessingQueue = true;
        // 取出最早的一条待处理消息
        const nextMessage = this.pendingQueue.shift();
        // 递归触发，确保不超出最大连续次数
        this.trigger(nextMessage);
        this.isProcessingQueue = false;
        // 如果队列还有剩余，并且当前计数小于10，继续处理（但注意trigger内部会再次调用processQueue）
        if (this.pendingQueue.length > 0 && this.triggerCount < 10) {
          this.processQueue();
        }
      }
    },
    reset() {
      // 清除所有活跃提示
      this.activeToasts.forEach(toast => {
        if (toast.timeoutId) clearTimeout(toast.timeoutId);
      });
      this.activeToasts = [];
      this.triggerCount = 0;
      this.pendingQueue = [];
      this.isProcessingQueue = false;
    }
  },
  beforeDestroy() {
    // 组件销毁前清理所有定时器
    this.activeToasts.forEach(toast => {
      if (toast.timeoutId) clearTimeout(toast.timeoutId);
    });
  }
};
</script>

<style scoped>
.toast-container {
    position: absolute;
    top: 1.8rem;
    left: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: .1rem;
    pointer-events: none; /* 容器不干扰点击，但内部的toast可以点击关闭 */
}
.toast{
    margin: 0 auto;
}

.toast-message{
    position: relative;
    pointer-events: auto;
    max-width: 7rem;
    min-height: .3rem;
    line-height: .3rem;
    border-top-right-radius: .08rem;
    border-bottom-right-radius: .08rem;
    border: .01rem solid #8ae4f1;
    border-left: none;
    box-shadow: 0 0 .25rem #2F4F4F;
    background-image: linear-gradient(to right, rgba(0,0,0,.5) 0%, rgba(0,0,0,1) 35%, rgba(0,0,0,1) 100% );
    backdrop-filter: blur(.1rem);
    margin-bottom: .08rem;
    color: #fff;
    font-size: .24rem;
    text-align: left;
    padding: .1rem .32rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    cursor: pointer;
    transition: all .8s ease;
    overflow: hidden;
}

.message{
    position: relative;
    top:0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
}

.message-bg{
    position: absolute;
    top:0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    background-image: linear-gradient(to left, rgba(45,45,45,0) 0%, rgba(45,45,45,1) 100%);
    background-repeat: no-repeat;
    animation: floating 1s ease-out infinite;
    transform: translateX(100%);
}
@keyframes floating {
    to{
        transform: translateX(-100%);
    }
}

/* 进入/离开动画 */
.toast-enter-active,
.toast-leave-active{
    transition: all 0.3s ease;
}

.toast-enter-from{
    opacity: 0;
    transform: translateX(-.5rem);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(-.5rem);
}
</style>
