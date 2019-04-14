import {
    readdirSync
} from 'fs';
import {
    join,
    resolve,
    relative,
    dirname
} from 'path';
import {
    TARGET_DIR_NAME,
    VERSION_FILE_NAME,
    COMPONENT_IGNORE,
} from './config'

import { getPageConfigFilter } from './units';
import { normalize } from 'upath';



// 获取需要注入的组件
const getInjectComponents = (globalConfig, pageConfig) => {
    const targetPath = join('src', TARGET_DIR_NAME)
    const components = readdirSync(targetPath).filter(component => (!COMPONENT_IGNORE[component] && component != VERSION_FILE_NAME))

    const globalInject = globalConfig.inject ? components : [];
    if (typeof globalConfig.inject !== 'boolean')
        globalInject = globalConfig.inject;

        const pageInject = pageConfig.wux;
    return pageInject ? pageInject : globalInject;
}

const injectComponents = (op, setting) => {
    const filter = getPageConfigFilter(setting.pagePath);
    if (filter.test(op.file) && op.type === 'config') {
        const globalConfig = setting.config;
        const pageConfig = JSON.parse(op.code);

        // 将组件注入到json的usingComponents中
        const injectComponents = getInjectComponents(globalConfig, pageConfig); // 获取要注入的组件
        const relativePath = relative(dirname(op.file), resolve('dist/')); // 获取相对的路径
        pageConfig.usingComponents = pageConfig.usingComponents || {};
        injectComponents.forEach(component => (pageConfig.usingComponents[globalConfig.prefix + component] = normalize(relativePath) + '/' + TARGET_DIR_NAME + '/' + component + '/index'))

        op.code = JSON.stringify(pageConfig)  //更新文件内容
        op.output && op.output({
            action: '变更',
            file: op.file
        })
    }
    return op;
}

export default injectComponents;