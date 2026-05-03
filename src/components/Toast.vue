<template>
    <div class="toast-container">
        <!-- 普通提示 -->
        <TransitionGroup class="toast" name="toast" tag="div">
            <div v-for="toast in activeToasts" :key="toast.id" class="toast-message" @click.stop="manualClose(toast.id)" >
                <div class="message">{{ toast.message }}</div>
                <div class="message-bg"></div>
            </div>
        </TransitionGroup>

        <!-- 确认弹窗遮罩 -->
        <div v-if="confirmDialog.visible" class="confirm-mask" @click.self="handleCancel">
            <div class="confirm-dialog">
                <div class="confirm-content">{{ confirmDialog.tip }}</div>
                <div class="confirm-buttons">
                    <button class="confirm-btn cancel" @click="handleCancel">取消</button>
                    <button class="confirm-btn confirm" @click="handleConfirm">确认</button>
                </div>
            </div>
        </div>
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
      // 确认弹窗相关
      confirmDialog: {
        visible: false,
        tip: '',
        onConfirm: null,
        onCancel: null
      }
    };
  },
  methods: {
    // 普通提示（原有功能）
    trigger(message = "这是一条提示信息", period = 1.5) {
      if (this.triggerCount >= 10) {
        this.pendingQueue.push(message);
        this.processQueue();
        return false;
      }

      this.triggerCount++;
      const id = Date.now() + Math.random() * 10000;
      const newToast = {
        id,
        message,
        timeoutId: null,
      };

      const timeoutId = setTimeout(() => {
        this.closeToast(id);
      }, period * 1000);

      newToast.timeoutId = timeoutId;
      this.activeToasts.push(newToast);
      return true;
    },

    // 确认弹窗功能
    showConfirm({ confirmTip, onTapConfirm, onTapCancel }) {
      // 如果已有弹窗显示，先关闭（可选，这里选择覆盖之前的弹窗）
      if (this.confirmDialog.visible) {
        this.closeConfirm();
      }

      this.confirmDialog = {
        visible: true,
        tip: confirmTip || '确认执行此操作吗？',
        onConfirm: typeof onTapConfirm === 'function' ? onTapConfirm : null,
        onCancel: typeof onTapCancel === 'function' ? onTapCancel : null
      };
    },

    handleConfirm() {
      if (this.confirmDialog.onConfirm) {
        this.confirmDialog.onConfirm();
      }
      this.closeConfirm();
    },

    handleCancel() {
      if (this.confirmDialog.onCancel) {
        this.confirmDialog.onCancel();
      }
      this.closeConfirm();
    },

    closeConfirm() {
      this.confirmDialog = {
        visible: false,
        tip: '',
        onConfirm: null,
        onCancel: null
      };
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
        this.triggerCount--;
        if (this.triggerCount < 0) this.triggerCount = 0;
        this.processQueue();
      }
    },

    processQueue() {
      if (this.isProcessingQueue) return;
      if (this.pendingQueue.length > 0 && this.triggerCount < 10) {
        this.isProcessingQueue = true;
        const nextMessage = this.pendingQueue.shift();
        this.trigger(nextMessage);
        this.isProcessingQueue = false;
        if (this.pendingQueue.length > 0 && this.triggerCount < 10) {
          this.processQueue();
        }
      }
    },

    reset() {
      this.activeToasts.forEach(toast => {
        if (toast.timeoutId) clearTimeout(toast.timeoutId);
      });
      this.activeToasts = [];
      this.triggerCount = 0;
      this.pendingQueue = [];
      this.isProcessingQueue = false;
      this.closeConfirm(); // 重置时也关闭确认弹窗
    }
  },
  beforeDestroy() {
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
    pointer-events: none;
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

/* 确认弹窗样式 */
.confirm-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    pointer-events: auto;
}

.confirm-dialog {
    width: 5rem;
    background-image: linear-gradient(to right, rgba(0,0,0,.8) 0%, rgba(0,0,0,.1) 35%, rgba(0,0,0,.8) 100% );
    backdrop-filter: blur(.2rem);
    border: 0.01rem solid #8ae4f1;
    box-shadow: 0 0 0.3rem rgba(138, 228, 241, 0.3);
    overflow: hidden;
    animation: dialogFadeIn 0.2s ease-out;
}

.confirm-content {
    padding: 0.3rem 0.24rem;
    color: #fff;
    font-size: 0.26rem;
    text-align: center;
    line-height: 1.5;
    min-height: 0.8rem;
    word-break: break-word;
}

.confirm-buttons {
    display: flex;
    height: 1rem;
    line-height: 1rem;
    border-top: 0.01rem solid rgba(138, 228, 241, 0.3);
}

.confirm-btn {
    flex: 1;
    font-size: 0.24rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    background: transparent;
    font-family: inherit;
}

.confirm-btn.cancel {
    color: #aaa;
    border-right: 0.01rem solid rgba(138, 228, 241, 0.3);
}

.confirm-btn.cancel:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #fff;
}

.confirm-btn.confirm {
    color: #8ae4f1;
    font-weight: 500;
}

.confirm-btn.confirm:hover {
    background-color: rgba(138, 228, 241, 0.15);
}

@keyframes dialogFadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>
