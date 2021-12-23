<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStore } from '../store';

import { PlusCircleOutlined, CloseCircleOutlined, MinusCircleOutlined, RotateRightOutlined } from '@ant-design/icons-vue';
import { Empty } from 'ant-design-vue';
import PictureVue from './Picture.vue';

const url =
    'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F0193c96045927e11013ef90fd5ef74.jpg%401280w_1l_2o_100sh.jpg&refer=http%3A%2F%2Fimg.zcool.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1642828554&t=2548877e6582490b5a6a827ec447bc23';

const store = useStore();

const activeKey = ref<string>('blank');
const captures = computed(() => store.state.capture.captures);

const handleTabsChange = () => {};

const handleClickLoad = () => {
    store.dispatch('addCaptureFromUrl', url).then((key: string) => {
        activeKey.value = key;
    });
};
const handleClickRotate = () => {};
const handleClickClose = () => {
    const index = store.getters.activeIndex(activeKey.value);
    store.commit('removeCapture', activeKey.value);
    if (captures.value[index]) {
        activeKey.value = captures.value[index].key;
    } else if (captures.value[index - 1]) {
        activeKey.value = captures.value[index - 1].key;
    } else {
        activeKey.value = 'blank';
    }
};
const handleClickCloseAll = () => {
    store.commit('removeCapture');
    activeKey.value = 'blank';
};
</script>

<template>
    <a-tabs class="tabs" v-model:activeKey="activeKey">
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
                <a-button type="text" @click="handleClickLoad">
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
</style>
