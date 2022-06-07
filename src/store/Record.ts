import { defineStore } from 'pinia';
import { message } from 'ant-design-vue';
import 'ant-design-vue/es/message/style/index';
import { useCaptureStore } from './Capture';
import { useConfigurationStore } from './Configuration';
import { displayColor } from './Coordinate';

export interface IRecord {
    key: string;
    x: number;
    y: number;
    c: string;
    cNative: number;
}

export interface IRecordState {
    records: IRecord[];
}

export const useRecordStore = defineStore('record', {
    state: (): IRecordState => ({
        records: [],
    }),
    actions: {
        addRecord(x: number, y: number, c: string, cNative: number, key?: string) {
            if (this.records.length >= 20) {
                message.warning('最大取点数为20个');
                return;
            }
            if (!key) {
                const key = (this.records.length + 1).toString();
                this.records.push({ key, x, y, c, cNative });
            } else {
                const index = parseInt(key) - 1;
                for (let i = 0; i < index; i++) {
                    if (!this.records[i]) {
                        this.records[i] = { key: (i + 1).toString(), x: -1, y: -1, c: '-1', cNative: -1 };
                    }
                }
                this.records[index] = { key, x, y, c, cNative };
            }
        },
        removeRecord(key?: string) {
            if (key) {
                const filtered = this.records.filter(record => record.key !== key);
                const recognized = filtered.map((record, i) => ({ ...record, key: i.toString() }));
                this.records = recognized;
            } else {
                this.records = [];
            }
        },
        refetchRecord() {
            this.records.forEach((record, index) => {
                const capture = useCaptureStore();
                const jimp = capture.activeJimp;
                const cNative = jimp.getPixelColor(record.x, record.y);
                const configuration = useConfigurationStore();
                const mode = configuration.colorMode;
                const c = displayColor(cNative, mode);
                this.records[index] = { ...record, cNative, c };
            });
        },
    },
});
