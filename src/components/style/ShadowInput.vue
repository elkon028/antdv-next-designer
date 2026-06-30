<template>
    <div class="_fd-shadow-input">
        <ConfigItem :label="t('style.shadow.name')">
            <a-input allowClear v-model:value="value" @change="changeValue(value)" @keydown.enter="changeValue(value)" class="_fd-si-input">
                <template #addonAfter>
                    <a-dropdown>
                        <i class="fc-icon icon-setting"></i>
                        <template #popupRender>
                            <a-menu>
                                <a-menu-item v-for="item in options" @click="changeValue(item.value)">
                                    {{ item.label }}
                                </a-menu-item>
                            </a-menu>
                        </template>
                    </a-dropdown>
                </template>
            </a-input>
            <template #append>
                <ShadowContent v-model="value" @change="changeValue(value)"></ShadowContent>
            </template>
        </ConfigItem>
    </div>
</template>

<script>
import {defineComponent} from 'vue';
import ShadowContent from './ShadowContent.vue';
import ConfigItem from './ConfigItem.vue';

export default defineComponent({
    name: 'ShadowInput',
    emits: ['update:modelValue', 'change'],
    components: {ConfigItem, ShadowContent},
    inject: ['designer'],
    props: {
        modelValue: String,
    },
    watch: {
        modelValue() {
            this.value = this.modelValue || '';
        },
    },
    data() {
        const t = this.designer.setupState.t;
        return {
            t,
            options: [
                {label: t('style.shadow.classic'), value: '3px 5px 7px 2px #CBCBCB'},
                {label: t('style.shadow.flat'), value: '4px 4px 3px -2px #E7E5E5'},
                {label: t('style.shadow.solid'), value: '1px 2px 4px 2px #979797'}
            ],
            value: this.modelValue || ''
        }
    },
    methods: {
        changeValue(val) {
            this.value = val;
            this.$emit('update:modelValue', val);
            this.$emit('change', val);
        },
    },
    created() {
    }

});
</script>

<style>
._fd-shadow-input ._fd-ci-con {
    width: 150px;
}

._fd-si-input .ant-input-group-addon {
    width: 32px;
    padding: 0;
}

._fd-shadow-input ._fd-ci-con .fc-icon {
    cursor: pointer;
}
</style>
