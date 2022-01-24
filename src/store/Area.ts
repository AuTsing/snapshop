import { defineStore } from 'pinia';

export interface IAreaState {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export const useAreaStore = defineStore('area', {
    state: (): IAreaState => ({
        x1: -1,
        y1: -1,
        x2: -1,
        y2: -1,
    }),
    actions: {
        updateArea(x1: number, y1: number, x2: number, y2: number) {
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;
        },
        resetArea() {
            this.x1 = -1;
            this.y1 = -1;
            this.x2 = -1;
            this.y2 = -1;
        },
    },
});
