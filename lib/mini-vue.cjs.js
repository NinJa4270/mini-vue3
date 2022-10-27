'use strict';

const isObject = (val) => val !== null && typeof val === 'object';

const publicPropertiesMap = {
    $el: (i) => i.vnode.el
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // steupState
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    };
    return component;
}
function setupComponent(instance) {
    // initProps
    // initSlots
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    // ctx 代理
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // TODO: function object
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    if (component.render) {
        instance.render = component.render;
    }
}

function render(vnode, container) {
    // patch
    patch(vnode, container);
}
function patch(vnode, container) {
    // 判断处理
    if (typeof vnode.type === 'string') {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    // init 
    mountElement(vnode, container);
    // update
}
function mountElement(vnode, container) {
    // 存到 vnode 上
    const el = (vnode.el = document.createElement(vnode.type));
    const { children, props } = vnode;
    if (Array.isArray(children)) {
        mountChildren(vnode, el);
    }
    else if (typeof children === 'string') {
        el.textContent = children;
    }
    for (let key in props) {
        const prop = props[key];
        el.setAttribute(key, prop);
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach((v) => {
        patch(v, container);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    // vnode => patch
    // vnode => element => mountElement
    patch(subTree, container);
    // 组件的 所有的 element 都处理完毕
    // 将根节点的el 赋值到 当前组件的虚拟节点上
    instance.vnode.el = subTree.el;
}

function createVNode(type, props, children) {
    return {
        type,
        props,
        children,
        el: null
    };
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // component => vnode
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
