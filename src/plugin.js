import './require-babel-polyfill';
import merge from 'deepmerge';
import copyWux from './copy';
import injectComponents from './inject';
import px2 from './px2';
import { DEFAULT_CONFIG } from './config';

// check wux is installed or not
try {
    eval("require('wux-weapp/package.json')");
} catch (e) {
    throw new Error('\n 未检测到: wux-weapp \n 您是否安装 wux-weapp ? \n 尝试 npm i -S wux-weapp');
}

export default class WepyPluginWux {
    constructor(c = {}) {
        copyWux(); // 拷贝Wux到src下
        c = merge(c, { isPx2On: c.config && c.config.px2 })
        this.setting = merge(DEFAULT_CONFIG, c);
    }
    apply(op) {
        const setting = this.setting;
        const asyncApply = async () => {
            if (setting.isPx2On) {
                op = await px2(op, setting);
            }
            op = injectComponents(op, setting);
        }
        asyncApply().then(() => {
            op.next();
        })
    }
}
