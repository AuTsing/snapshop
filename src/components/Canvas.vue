<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import {
    CloseCircleOutlined,
    MinusCircleOutlined,
    RotateRightOutlined,
    LoadingOutlined,
    FolderOpenOutlined,
    CloudDownloadOutlined,
} from '@ant-design/icons-vue';
import { Empty, message } from 'ant-design-vue';
import { Key } from 'ant-design-vue/es/_util/type';

import { useCaptureStore } from '../store/Capture';
import { useConfigurationStore } from '../store/Configuration';
import PictureVue from './Picture.vue';
import OpenerVue from './Opener.vue';

const captureStore = useCaptureStore();
const configurationStore = useConfigurationStore();

const refOpener = ref();
const { activeKey, captures, loading: spinning } = storeToRefs(captureStore);
let dragingTarget: EventTarget | null = null;

const handleTabsChange = (key: Key) => {
    captureStore.activeKey = key.toString();
};

const handleClickLoadRemote = async () => {
    captureStore.loading = true;
    const key = await captureStore.addCaptureFromLink(configurationStore.usingApi);
    captureStore.activeKey = key;
    captureStore.loading = false;
};

const handleClickLoadLocal = async (e: any) => {
    const files = Array.from(e.target.files as FileList);
    captureStore.loading = true;
    for (const file of files) {
        const key = await captureStore.addCaptureFromFile(file);
        captureStore.activeKey = key;
    }
    e.target.value = null;
    captureStore.loading = false;
};

const handleClickRotate = async () => {
    captureStore.loading = true;
    await captureStore.rotateCapture();
    captureStore.loading = false;
};

const handleClickClose = () => {
    const index = captureStore.activeIndex;
    captureStore.removeCapture(activeKey.value);
    if (captures.value[index]) {
        captureStore.activeKey = captures.value[index].key;
    } else if (captures.value[index - 1]) {
        captureStore.activeKey = captures.value[index - 1].key;
    } else {
        captureStore.activeKey = 'blank';
    }
};

const handleClickCloseAll = () => {
    captureStore.removeCapture();
    captureStore.activeKey = 'blank';
};

const handleDragEnter = (e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragingTarget = e.target;
    captureStore.loading = true;
};

const handleDragOver = (e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
};

const handleDragLeave = (e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (dragingTarget === e.target) {
        captureStore.loading = false;
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
            const key = await captureStore.addCaptureFromFile(file);
            captureStore.activeKey = key;
        }
    } catch (error) {
        if (error instanceof Error) {
            message.error('打开图片失败: ' + error.message);
        }
    }
    captureStore.loading = false;
};

const handleClickOpen = () => {
    refOpener.value.handleClickOpen();
};

defineExpose({
    handleClickLoadRemote,
    handleClickOpen,
});
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
                    <div :style="{ margin: '0 7px' }">
                        <a-tooltip title="远程加载图片">
                            <a-button type="text" @click="handleClickLoadRemote">
                                <template #icon><CloudDownloadOutlined /></template>
                            </a-button>
                        </a-tooltip>
                        <OpenerVue ref="refOpener" :handleChangeFile="handleClickLoadLocal" acceptExt=".png,.jpg">
                            <template #default>
                                <a-tooltip title="本地加载图片">
                                    <a-button type="text">
                                        <template #icon><FolderOpenOutlined /></template>
                                    </a-button>
                                </a-tooltip>
                            </template>
                        </OpenerVue>
                    </div>
                </template>
                <template v-if="captures.length !== 0" #rightExtra>
                    <div :style="{ margin: '0 7px' }">
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
                    </div>
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
