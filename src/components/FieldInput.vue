<template>
    <div class="_fd-field-input">
        <i class="fc-icon icon-group" @click.stop="copy"></i>
        <a-input
            v-if="!fieldList.length"
            v-model:value="value"
            :readonly="fieldReadonly || disabled"
            :disabled="fieldReadonly || disabled"
            size="small"
            @focus="onFocus"
            @blur="onInput"
        >
            <template #addonAfter v-if="!fieldReadonly">
                <i class="fc-icon icon-auto" @click="makeField"></i>
            </template>
        </a-input>
        <a-tree-select
            v-else
            :classNames="{popup: {root: '_fd-tree-select-dropdown'}}"
            v-model:value="value"
            show-search
            :disabled="disabled"
            :styles="{popup: {root: {maxHeight: '400px', overflow: 'auto'}}}"
            tree-default-expand-all
            :tree-data="fieldList"
            size="small"
            tree-node-filter-prop="label"
            @keydown.enter="updateValue"
            @focus="onFocus"
            @select="currentChange"
        >
        </a-tree-select>
    </div>
</template>

<script>
import {defineComponent, nextTick, onUnmounted} from 'vue';
import uniqueId from '@form-create/utils/lib/unique';
import {copyTextToClipboard, escapeRegExp} from '../utils';
import errorMessage from '../utils/message';
import is from '@form-create/utils/lib/type';
import {deepCopy} from '@form-create/utils/lib/deepextend';

export default defineComponent({
    name: 'FieldInput',
    inject: ['designer'],
    emits: ['update:modelValue'],
    props: {
        modelValue: String,
        disabled: Boolean,
    },
    computed: {
        fieldList() {
            if (this.key) {
                return this.getFieldList();
            }
            return [];
        },
        subformFieldList() {
            const fieldList = this.designer.setupState.fieldList || [];
            const _fieldList = this.fieldLeafSelectable ? fieldList : this.removeLeafNodes(deepCopy(fieldList));
            if (_fieldList.length) {
                return _fieldList;
            }
            return fieldList;
        },
        fieldReadonly() {
            return this.designer.setupState.fieldReadonly;
        },
        isSubform() {
            return this.activeRule && this.activeRule._menu.subForm;
        },
        activeRule() {
            return this.designer.setupState.activeRule;
        },
        relationField() {
            return this.designer.props.config.relationField;
        },
        fieldLeafSelectable() {
            return this.designer.props.config.fieldLeafSelectable !== false;
        },
        t() {
            return this.designer.setupState.t;
        },
    },
    data() {
        return {
            value: this.modelValue || '',
            oldValue: '',
            key: 1,
            activeNode: null,
        };
    },
    watch: {
        modelValue(n) {
            this.value = n;
        },
    },
    methods: {
        updateValue(e) {
            if (this.fieldReadonly || this.disabled) {
                return;
            }
            this.value = e.target.value;
            this.onInput();
            e.target.blur();
        },
        getFieldList() {
            let fieldList = this.designer.props.config?.fieldList || [];
            if (this.relationField === false) {
                return fieldList;
            }
            if (this.isSubform) {
                fieldList = this.subformFieldList;
            } else {
                const rule = this.activeRule;
                let ctx = rule && rule.__fc__ && rule.__fc__.parent;
                while (ctx) {
                    if (ctx.rule._menu && ['array', 'object'].indexOf(ctx.rule._menu.subForm) > -1) {
                        const _fieldList = this.findChildrenById(fieldList, ctx.rule.field) || fieldList;
                        if (_fieldList.length) {
                            fieldList = _fieldList;
                        }
                        break;
                    } else {
                        ctx = ctx.parent;
                    }
                }
            }
            return fieldList;
        },
        removeLeafNodes(tree) {
            if (!Array.isArray(tree) || tree.length === 0) {
                return tree;
            }

            function recurse(nodes) {
                return nodes.filter(node => {
                    if (node.children && node.children.length > 0) {
                        node.children = recurse(node.children);
                        return true;
                    }
                    return false;
                });
            }

            return recurse(tree);
        },
        findChildrenById(tree, id) {
            if (!Array.isArray(tree)) {
                return null;
            }
            for (const node of tree) {
                if (node.value === id) {
                    return node.children || [];
                }
                if (node.children) {
                    const result = this.findChildrenById(node.children, id);
                    if (result !== null) {
                        return result;
                    }
                }
            }
            return null;
        },
        copy() {
            copyTextToClipboard(this.modelValue);
        },
        getSubChildren() {
            let subChildren = this.designer.setupState.getSubFormChildren(this.activeRule) || [];
            subChildren = is.trueArray(subChildren) ? subChildren : this.designer.setupState.children;
            return subChildren;
        },
        getSubFieldChildren() {
            const subChildren = this.getSubChildren();
            const list = [];
            const getRule = children => {
                children &&
                children.forEach(rule => {
                    if (rule && rule._fc_drag_tag && rule.field) {
                        list.push({...rule, children: []});
                    } else if (rule && rule.children) {
                        getRule(rule.children);
                    }
                });
                return list;
            };
            return getRule(subChildren);
        },
        checkValue() {
            const oldField = this.oldValue;
            const temp = escapeRegExp(oldField);
            let field = (this.value || '').replace(/[\s\　]/g, '');
            if (!field) {
                errorMessage(this.t('computed.fieldEmpty'));
                return oldField;
            } else if (!/^[a-zA-Z]/.test(field)) {
                errorMessage(this.t('computed.fieldChar'));
                return oldField;
            } else if (oldField !== field) {
                const flag = field.indexOf('.') > -1;
                if (flag) {
                    field = field.replaceAll('.', '_');
                }
                if (
                    this.designer.setupState.getConfig('checkFieldUnique') !== false &&
                    this.getSubFieldChildren().filter(v => v.field === field).length > 0
                ) {
                    errorMessage(this.t('computed.fieldExist', {label: field}));
                    return oldField;
                }
                // else if (temp) {
                //     const regex = /"_computed"\s*:\s*(\{\s*(?:"[^"]*"\s*:\s*"(?:\\"|[^"])*"(?:,\s*)?)*\})/g;
                //     const subChildren = this.getSubChildren();
                //     const json = JSON.stringify(subChildren).replace(JSON.stringify(this.activeRule), '');
                //     let match;
                //     while ((match = regex.exec(json)) !== null) {
                //         const obj = JSON.parse(match[1]);
                //         let _exec = false;
                //         Object.keys(obj).forEach(k => {
                //             if (!_exec) {
                //                 const fieldRag = new RegExp(`(${temp})(?![a-zA-Z0-9_$])`, 'g');
                //                 _exec = !!obj[k].match(fieldRag);
                //             }
                //         });
                //         if (_exec) {
                //             errorMessage(this.t('computed.fieldUsed', {label: oldField}));
                //             return oldField;
                //         }
                //     }
                // }
                if (flag) {
                    return field;
                }
            }
            this.oldValue = '';
            return field;
        },
        onFocus() {
            this.oldValue = this.value;
        },
        makeField() {
            this.oldValue = this.value;
            this.value = uniqueId();
            this.onInput();
        },
        updateRule(node) {
            const update = {...(node.update || {})};
            if (!update.title) {
                update.title = node.label;
            }
            this.designer.setupState.mergeRule(this.activeRule, update);
            this.designer.setupState.updateRuleFormData();
        },
        onInput() {
            if (this.value !== this.modelValue) {
                this.value = this.checkValue();
                if (this.value !== this.modelValue) {
                    const node = this.activeNode;
                    this.activeNode = null;
                    this.oldValue = this.value;
                    this.designer.emit('changeField', {field: this.value, oldField: this.modelValue, rule: this.activeRule});
                    this.$emit('update:modelValue', this.value);
                    if (node) {
                        this.updateRule(node);
                    }
                }
            }
        },
        currentChange(value, node) {
            this.activeNode = node;
            this.onInput();
        },
    },
    mounted() {
        const updateKey = () => {
            nextTick(() => {
                ++this.key;
            });
        };
        this.designer.setupState.bus.$on('dragEnd', updateKey);
        onUnmounted(() => {
            this.designer.setupState.bus.$off('dragEnd', updateKey);
        });
    },
});
</script>

<style>
._fd-field-input {
    width: 100%;
}

._fd-field-input > .fc-icon {
    position: absolute;
    right: 32px;
    top: 0;
    z-index: 3;
    color: #a8abb2;
    cursor: pointer;
    width: 24px;
    height: 24px;
    text-align: center;
}

._fd-field-input .ant-tree-select {
    width: 100%;
}

._fd-field-input .ant-select-tree-indent-unit {
    width: 5px;
}

._fd-field-input .ant-input-group-addon {
    width: 25px;
    padding: 0;
    margin: 0;
    color: #aaaaaa;
    cursor: pointer;
}
</style>
