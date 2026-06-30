<script>
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ApiKeyInput',
    emits: ['save', 'cancel'],
    data() {
        return {
            showModal: false,
            apiKey: '',
            isValidating: false,
            errorMessage: '',
        };
    },
    methods: {
        openModal() {
            this.showModal = true;
            this.loadStoredApiKey();
        },

        closeModal() {
            this.showModal = false;
            this.resetForm();
            this.$emit('cancel');
        },

        async save() {
            if (!this.validateApiKey()) {
                return;
            }

            this.isValidating = true;

            try {
                // 保存到本地存储
                localStorage.setItem('fc_api_key', this.apiKey);

                // 触发保存事件
                this.$emit('save', this.apiKey);

                // 关闭弹窗
                this.closeModal();
            } catch (error) {
                this.errorMessage = '保存失败，请重试';
            } finally {
                this.isValidating = false;
            }
        },

        validateApiKey() {
            this.errorMessage = '';

            if (!this.apiKey.trim()) {
                return true;
            }

            if (!this.apiKey.startsWith('fc-')) {
                this.errorMessage = 'API Key 格式不正确，应以 "fc-" 开头';
                return false;
            }

            return true;
        },
        resetForm() {
            this.apiKey = '';
            this.errorMessage = '';
            this.isValidating = false;
        },
        loadStoredApiKey() {
            const stored = localStorage.getItem('fc_api_key');
            if (stored) {
                this.apiKey = stored;
            }
        },
    },
    mounted() {
        this.loadStoredApiKey();
        this.$emit('save', this.apiKey);
    },
});
</script>

<template>
    <div class="api-key-container">
        <!-- 触发按钮 -->
        <div class="api-key-trigger" @click="openModal">
            <span class="api-key-text">API Key</span>
        </div>
        <div class="api-key-badge">AI</div>

        <!-- 弹窗遮罩 -->
        <div v-if="showModal" class="modal-overlay" @click="closeModal">
            <div class="modal-container" @click.stop>
                <!-- 关闭按钮 -->
                <button class="close-btn" @click="closeModal">&times;</button>

                <!-- 弹窗头部 -->
                <div class="api-key-header">
                    <div class="openai-logo">
                        <img src="https://img.form-create.com/file/img/img.png" style="width: 30px" alt="logo" />
                    </div>
                    <h2 class="modal-title">输入您的 API Key</h2>
                </div>

                <!-- 弹窗内容 -->
                <div class="api-key-content">
                    <div class="info-text">
                        <p>您需要 API Key 才能使用此应用。</p>
                        <p>您的 API Key 仅存储在本地浏览器中，不会发送到任何其他地方。</p>
                    </div>

                    <div class="input-group">
                        <input
                            v-model.trim="apiKey"
                            type="password"
                            class="api-key-input"
                            placeholder="fc-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            :class="{ 'error': errorMessage }"
                            @keyup.enter="save"
                            @input="errorMessage = ''"
                        />
                        <div v-if="errorMessage" class="error-message">
                            {{ errorMessage }}
                        </div>
                    </div>

                    <div class="help-link">
                        <a href="https://form-create.com/service/user/api" target="_blank" class="dashboard-link">
                            <svg viewBox="0 0 24 24" class="arrow-icon">
                                <path
                                    d="M7 17L17 7M17 7H7M17 7V17"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    fill="none"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                            从 FormCreate 个人中心获取您的 API Key
                        </a>
                    </div>
                </div>

                <!-- 弹窗底部 -->
                <div class="api-key-footer">
                    <button class="btn btn-primary" @click="save">
                        <svg v-if="!isValidating" viewBox="0 0 24 24" class="btn-icon">
                            <path
                                d="M20 6L9 17l-5-5"
                                stroke="currentColor"
                                stroke-width="2"
                                fill="none"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                        <svg v-else viewBox="0 0 24 24" class="btn-icon loading">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" />
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" fill="none" />
                        </svg>
                        {{ isValidating ? '保存中...' : '保存' }}
                    </button>
                    <button class="btn btn-secondary" @click="closeModal">取消</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.api-key-container {
    display: inline-block;
    position: relative;
    margin-left: 20px;
}

.api-key-trigger {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    background: linear-gradient(135deg, rgb(56, 123, 246) 0%, rgb(37, 99, 235) 100%);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
        0 4px 12px rgba(56, 123, 246, 0.3),
        0 2px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
}

.api-key-trigger::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
}

.api-key-trigger:hover::before {
    left: 100%;
}

.api-key-trigger:hover {
    box-shadow:
        0 8px 25px rgba(56, 123, 246, 0.4),
        0 4px 12px rgba(0, 0, 0, 0.15);
    background: linear-gradient(135deg, rgb(37, 99, 235) 0%, rgb(29, 78, 216) 100%);
}

.api-key-trigger:active {
    transform: translateY(-1px) scale(1.02);
    transition: all 0.1s ease;
}

.api-key-text {
    font-size: 14px;
    font-weight: 600;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    letter-spacing: 0.5px;
}

.api-key-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    padding: 2px 6px;
    font-size: 10px;
    font-weight: 700;
    color: white;
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
    border-radius: 10px;
    box-shadow:
        0 2px 8px rgba(255, 107, 107, 0.4),
        0 1px 3px rgba(0, 0, 0, 0.2);
    animation: badge-pulse 2s ease-in-out infinite;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

@keyframes badge-pulse {
    0%,
    100% {
        transform: scale(1);
        box-shadow:
            0 2px 8px rgba(255, 107, 107, 0.4),
            0 1px 3px rgba(0, 0, 0, 0.2);
    }
    50% {
        transform: scale(1.1);
        box-shadow:
            0 4px 12px rgba(255, 107, 107, 0.6),
            0 2px 6px rgba(0, 0, 0, 0.3);
    }
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3000;
    backdrop-filter: blur(5px);
}

.modal-container {
    background: white;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 500px;
    position: relative;
    animation: modalSlideIn 0.3s ease-out;
    box-sizing: content-box;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-50px) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    font-size: 24px;
    color: #6c757d;
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.close-btn:hover {
    background: #f8f9fa;
    color: #333;
}

.api-key-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
}

.openai-logo {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(56, 123, 246, 0.3);
}

.modal-title {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
    line-height: 1.2;
}

.api-key-content {
    margin-bottom: 32px;
}

.info-text {
    margin-bottom: 24px;
}

.info-text p {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    margin: 0 0 8px 0;
}

.info-text p:last-child {
    margin-bottom: 0;
    color: #888;
}

.input-group {
    margin-bottom: 20px;
}

.api-key-input {
    width: 100%;
    padding: 16px 20px;
    border: 2px solid #e1e5e9;
    border-radius: 12px;
    font-size: 16px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    background: #fafbfc;
    transition: all 0.3s ease;
    box-sizing: border-box;
}

.api-key-input:focus {
    outline: none;
    border-color: rgb(56, 123, 246);
    background: white;
    box-shadow: 0 0 0 3px rgba(56, 123, 246, 0.1);
}

.api-key-input.error {
    border-color: #ef4444;
    background: #fef2f2;
}

.api-key-input.error:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
    margin-top: 8px;
    font-size: 14px;
    color: #ef4444;
    display: flex;
    align-items: center;
    gap: 6px;
}

.error-message::before {
    content: '⚠';
    font-size: 16px;
}

.help-link {
    text-align: center;
}

.dashboard-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: rgb(56, 123, 246);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.3s ease;
}

.dashboard-link:hover {
    color: rgb(37, 99, 235);
    text-decoration: underline;
}

.arrow-icon {
    width: 16px;
    height: 16px;
}

.api-key-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.btn {
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 100px;
    justify-content: center;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-primary {
    background: rgb(56, 123, 246);
    color: white;
    box-shadow: 0 2px 8px rgba(56, 123, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
    background: rgb(37, 99, 235);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(56, 123, 246, 0.4);
}

.btn-secondary {
    background: transparent;
    color: #666;
    border: 1px solid #e1e5e9;
}

.btn-secondary:hover {
    background: #f8f9fa;
    color: #333;
}

.btn-icon {
    width: 16px;
    height: 16px;
}

.btn-icon.loading {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .api-key-header {
        flex-direction: column;
        text-align: center;
        gap: 12px;
    }

    .modal-title {
        font-size: 20px;
    }

    .api-key-footer {
        flex-direction: column;
    }

    .btn {
        width: 100%;
    }
}
</style>
