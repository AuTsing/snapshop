<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '../store';
import { IRecord } from '../store/Record';
import { useControlCv } from '../plugins/ControlCv';

import { CopyOutlined, DeleteOutlined } from '@ant-design/icons-vue';

const store = useStore();
const controlCv = useControlCv();

const pointsColumns = [
    { title: '坐标', dataIndex: 'xy', width: '33%', align: 'center' },
    { title: '颜色值', dataIndex: 'c', width: '33%', align: 'center' },
    { title: '操作', dataIndex: 'action', width: '34%', align: 'center' },
];
const areaColumns = [
    { title: '范围', dataIndex: 'area', width: '50%', align: 'center' },
    { title: '操作', dataIndex: 'action', width: '50%', align: 'center' },
];

const records = computed(() => store.state.record.records);
const areas = computed(() => {
    const { x1, y1, x2, y2 } = store.state.area;
    if (x1 === -1 && y1 === -1 && x2 === -1 && y2 === -1) {
        return [];
    } else {
        return [store.state.area];
    }
});

const handleClickCopyRecord = (record: IRecord) => {
    controlCv.ctrlC(`${record.x},${record.y},${record.c}`);
};
const handleClickRemoveRecord = (record: IRecord) => {
    store.commit('removeRecord', record.key);
};
const handleClickCopyArea = (record: { x1: number; y1: number; x2: number; y2: number }) => {
    controlCv.ctrlC(`${record.x1},${record.y1},${record.x2},${record.y2}`);
};
const handleClickResetArea = () => {
    store.commit('resetArea');
};
</script>

<template>
    <a-table :columns="pointsColumns" :data-source="records" bordered size="small" :pagination="false">
        <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'xy'">
                {{ `${record.x},${record.y}` }}
            </template>
            <template v-if="column.dataIndex === 'c'">
                <a-tag class="tag" :color="`#${record.c.slice(2)}`">{{ record.c }}</a-tag>
            </template>
            <template v-if="column.dataIndex === 'action'">
                <a-space>
                    <CopyOutlined @click="() => handleClickCopyRecord(record)" />
                    <DeleteOutlined @click="() => handleClickRemoveRecord(record)" />
                </a-space>
            </template>
        </template>
        <template #emptyText>
            {{ '鼠标左键/数字键1-9开始取色' }}
        </template>
    </a-table>
    <a-table :columns="areaColumns" :data-source="areas" bordered size="small" :pagination="false">
        <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'area'">
                {{ `${record.x1},${record.y1},${record.x2},${record.y2}` }}
            </template>
            <template v-if="column.dataIndex === 'action'">
                <a-space>
                    <CopyOutlined @click="() => handleClickCopyArea(record)" />
                    <DeleteOutlined @click="handleClickResetArea" />
                </a-space>
            </template>
        </template>
        <template #emptyText>
            {{ 'Q/E开始选取范围' }}
        </template>
    </a-table>
</template>

<style scoped>
.tag {
    width: 100%;
    text-shadow: #000 1px 0 0, #000 0 1px 0, #000 -1px 0 0, #000 0 -1px 0;
}
</style>
