<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStore } from '../store';

import { PlusCircleOutlined, CloseCircleOutlined, MinusCircleOutlined, RotateRightOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import { Empty, message } from 'ant-design-vue';
import PictureVue from './Picture.vue';

const url =
    'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F0193c96045927e11013ef90fd5ef74.jpg%401280w_1l_2o_100sh.jpg&refer=http%3A%2F%2Fimg.zcool.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1642828554&t=2548877e6582490b5a6a827ec447bc23';

const store = useStore();

const activeKey = computed(() => store.state.capture.activeKey);
const captures = computed(() => store.state.capture.captures);
const spinning = computed(() => store.state.capture.loading);
let dragingTarget: EventTarget | null = null;

const handleTabsChange = (key: string) => {
    store.commit('setActiveKey', key);
};

const handleClickLoad = async () => {
    store.commit('setCaptureLoading', true);
    const key = await store.dispatch('addCaptureFromLink', store.state.configuration.link);
    store.commit('setActiveKey', key);
    store.commit('setCaptureLoading', false);
};
const handleClickRotate = async () => {
    store.commit('setCaptureLoading', true);
    await store.dispatch('rotateCapture');
    store.commit('setCaptureLoading', false);
};
const handleClickClose = () => {
    const index = store.getters.activeIndex;
    store.commit('removeCapture', activeKey.value);
    if (captures.value[index]) {
        store.commit('setActiveKey', captures.value[index].key);
    } else if (captures.value[index - 1]) {
        store.commit('setActiveKey', captures.value[index - 1].key);
    } else {
        store.commit('setActiveKey', 'blank');
    }
};
const handleClickCloseAll = () => {
    store.commit('removeCapture');
    store.commit('setActiveKey', 'blank');
};
const handleDragEnter = (e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragingTarget = e.target;
    store.commit('setCaptureLoading', true);
};
const handleDragOver = (e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
};
const handleDragLeave = (e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (dragingTarget === e.target) {
        store.commit('setCaptureLoading', false);
    }
};
const handleDrop = async (e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
        if (!e.dataTransfer) {
            throw new Error('不支持的格式');
        }
        const fileList = Array.from(e.dataTransfer.files);
        if (fileList.length === 0) {
            throw new Error('未选择图片');
        }
        const exts = fileList.map(file => file.type);
        if (exts.some(ext => ext !== 'image/png')) {
            throw new Error('不支持的格式');
        }
        for (const file of fileList) {
            const key = await store.dispatch('addCaptureFromFile', file);
            store.commit('setActiveKey', key);
        }
    } catch (error) {
        if (error instanceof Error) {
            message.error('打开图片失败: ' + error.message);
        }
    }
    store.commit('setCaptureLoading', false);
};
</script>

<template>
    <div style="height: 100%" @dragenter="handleDragEnter" @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop">
        <a-spin wrapperClassName="spin" :spinning="spinning">
            <a-tabs class="tabs" :activeKey="activeKey" @change="handleTabsChange">
                <a-tab-pane v-if="captures.length === 0" key="blank" tab="起始页">
                    <div class="empty-container">
                        <a-empty class="empty" :image="Empty.PRESENTED_IMAGE_SIMPLE" description="将图片拖入打开图片" />
                    </div>
                </a-tab-pane>
                <a-tab-pane v-for="capture in captures" :key="capture.key" :tab="capture.title">
                    <PictureVue :base64="capture.base64"></PictureVue>
                </a-tab-pane>
                <template #leftExtra>
                    <a-tooltip title="加载图片">
                        <a-button class="load-button" type="text" @click="handleClickLoad">
                            <template #icon><PlusCircleOutlined /></template>
                        </a-button>
                    </a-tooltip>
                </template>
                <template v-if="captures.length !== 0" #rightExtra>
                    <a-tooltip title="顺时针旋转90°">
                        <a-button type="text" @click="handleClickRotate">
                            <template #icon><RotateRightOutlined /></template>
                        </a-button>
                    </a-tooltip>
                    <a-tooltip title="关闭页面">
                        <a-button type="text" @click="handleClickClose">
                            <template #icon><MinusCircleOutlined /></template>
                        </a-button>
                    </a-tooltip>
                    <a-tooltip title="关闭所有页面">
                        <a-button type="text" @click="handleClickCloseAll">
                            <template #icon><CloseCircleOutlined /></template>
                        </a-button>
                    </a-tooltip>
                </template>
            </a-tabs>
            <template #indicator>
                <LoadingOutlined :style="{ fontSize: '24px' }" />
            </template>
        </a-spin>
    </div>
</template>

<style lang="less" scoped>
.tabs {
    height: 100%;
}
.empty-container {
    display: flex;
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
}
.load-button {
    height: 46px;
    width: 46px;
}
.spin {
    height: 100%;
}
:deep(.ant-tabs-nav) {
    margin: 0;
}
:deep(.ant-tabs-content-holder) {
    padding: 10px;
}
:deep(.ant-tabs-content) {
    height: 100%;
    width: 100%;
}
:deep(.ant-spin) {
    max-height: none !important;
}
:deep(.ant-spin-container) {
    height: 100%;
}
:deep(.ant-spin-dot) {
    margin: -12px !important;
}
</style>
