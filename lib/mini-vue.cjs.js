'use strict';

const isObject = (val) => val !== null && typeof val === 'object';
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const isString = (val) => typeof val === 'string';
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty.call(val, key);
const EMPTY_OBJ = {};

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const shapeFlag = isString(type) ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag
    };
    if (children) {
        vnode.shapeFlag |= isString(children)
            ? 4 /* ShapeFlags.TEXT_CHILDREN */
            : 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOTS_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlot(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
        else {
            return createVNode(Fragment, {}, [slot]);
        }
    }
}

const extend = Object.assign;
let shouldTrack = true; // 是否应该收集依赖的标识
let activeEffect; // 用来向 tarck 传递 effect fn 做依赖收集
class ReactiveEffect {
    constructor(fn, scheduler = null) {
        this.fn = fn;
        this.scheduler = scheduler;
        this.active = true;
        this.fn = fn;
        this.deps = [];
    }
    run() {
        // shouldTrack 来处理是否收集依赖
        if (!this.active) {
            return this.fn();
        }
        shouldTrack = true;
        activeEffect = this;
        // reset
        const result = this.fn();
        shouldTrack = false;
        return result;
    }
    stop() {
        // 通过 effect 找到 dep 并清除
        // this.active 优化 多次调用stop时 不需要再去清空
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    const { deps } = effect;
    if (deps.length) {
        for (let i = 0; i < deps.length; i++) {
            deps[i].delete(effect);
        }
        deps.length = 0;
    }
}
// 副作用
function effect(fn, options) {
    // const scheduler = options?.scheduler
    // const onStop = options?.onStop
    const _effect = new ReactiveEffect(fn);
    extend(_effect, options);
    // _effect.onStop = onStop
    // _effect.scheduler = scheduler
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
const targetMap = new WeakMap();
function track(target, key) {
    if (activeEffect && shouldTrack) {
        // target => key => dep
        // 获取 target => (key=>dep map)  
        let depsMap = targetMap.get(target);
        // 初始化 (key=>dep set) 容器
        if (!depsMap) {
            depsMap = new Map();
            targetMap.set(target, depsMap);
        }
        // 获取 key=> (dep set) 
        let dep = depsMap.get(key);
        // 初始化 (dep map)  容器
        if (!dep) {
            dep = new Set();
            depsMap.set(key, dep);
        }
        trackEffects(dep);
    }
}
// 抽离依赖收集逻辑 给ref使用
function trackEffects(dep) {
    // 优化 处理重复收集
    if (!dep.has(activeEffect)) {
        // 考虑如何拿到 effect中的 fn ？
        // 通过一个全局变量 activeEffect 来传递
        dep.add(activeEffect);
        // 考虑如何在 effect 中找到 dep
        // 通过反向收集
        activeEffect.deps.push(dep);
    }
}
// 依赖通知
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);
    triggerEffects(dep);
}
// 抽离依赖通知逻辑 给ref使用
function triggerEffects(dep) {
    dep.forEach((_effect) => {
        if (_effect.scheduler) {
            _effect.scheduler();
        }
        else {
            _effect.run();
        }
    });
}

// 优化点 只创建一次 不需要每次都创建
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        // nested object
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        // 依赖收集
        if (!isReadonly) {
            track(target, key);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, newValue) {
        const res = Reflect.set(target, key, newValue);
        //  依赖触发
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
        return true;
    },
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function reactive(target) {
    return createReactiveObject(target, mutableHandlers);
}
function readonly(target) {
    return createReactiveObject(target, readonlyHandlers);
}
function shallowReadonly(target) {
    return createReactiveObject(target, shallowReadonlyHandlers);
}
function createReactiveObject(target, baseHandlers) {
    return new Proxy(target, baseHandlers);
}
function isReactive(value) {
    return !!value["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */];
}
const toReactive = (value) => isObject(value) ? reactive(value) : value;

class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        // 判断 value 是否为对象 如果是对象 需要用 reactive包裹
        this._value = toReactive(value);
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newVal) {
        // 对比没有处理过的value 而不是 可能被 reactive后的value
        if (hasChanged(newVal, this._rawValue)) {
            this._rawValue = newVal;
            this._value = toReactive(newVal);
            // 触发依赖
            triggerRefValue(this);
        }
    }
}
function trackRefValue(ref) {
    if (shouldTrack && activeEffect) {
        // 依赖收集
        trackEffects(ref.dep);
    }
}
function triggerRefValue(ref) {
    triggerEffects(ref.dep);
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!((ref === null || ref === void 0 ? void 0 : ref.__v_isRef) === true);
}
function unref(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, {
        get(target, key) {
            return unref(Reflect.get(target, key));
        },
        set(target, key, newVal) {
            const oldValue = target[key];
            // 原始值是 ref 新值不是 ref 去修改 value
            if (isRef(oldValue) && !isRef(newVal)) {
                return target[key].value = newVal;
            }
            else {
                // 否则 直接去替换
                return Reflect.set(target, key, newVal);
            }
        }
    });
}

function emit(instance, event, ...args) {
    // 从组件中 找到对应的 event
    const { props } = instance;
    // TPP 
    // const handler = props['onAdd']
    // handler && handler()
    const camelize = (str) => str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const toHandlerKey = (str) => {
        return str ? 'on' + capitalize(str) : '';
    };
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // steupState
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            // props
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOTS_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const slot = children[key];
        if (typeof slot === 'function') {
            slots[key] = (props = {}) => normalizeSlotValue(slot(props));
        }
        else {
            slots[key] = slot;
        }
    }
}
function normalizeSlotValue(slot) {
    return Array.isArray(slot) ? slot : [slot];
}

function createComponentInstance(vnode, parent = null) {
    const instance = {
        proxy: null,
        render: null,
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { },
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        subTree: null,
        isMounted: false
    };
    instance.emit = emit.bind(null, instance);
    return instance;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    // ctx 代理
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // TODO: function object
    if (typeof setupResult === 'object') {
        // 通过  proxyRefs 是 setup 返回值 不需要访问 .value
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    if (component.render) {
        instance.render = component.render;
    }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    var _a;
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = ((_a = currentInstance.parent) === null || _a === void 0 ? void 0 : _a.provides) || {};
        if (provide === parentProvides) {
            // 利用原型链
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defalutValue) {
    var _a;
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = (_a = currentInstance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defalutValue !== undefined) {
            if (typeof defalutValue === 'function') {
                return defalutValue();
            }
            return defalutValue;
        }
    }
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // component => vnode
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options;
    function render(vnode, container) {
        // patch
        patch(null, vnode, container, null);
    }
    function patch(n1, n2, container, parentComponent) {
        // 判断处理
        const { type, shapeFlag } = n2;
        // 需要特殊处理的 type 
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    // 处理 element
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            // init 
            mountElement(n2, container, parentComponent);
        }
        else {
            // update
            patchElement(n1, n2, container, parentComponent);
        }
    }
    // 更新 element
    function patchElement(n1, n2, container, parentComponent) {
        // 对比
        const el = (n2.el = n1.el);
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        // 对比children
        patchChildren(n1, n2, el, parentComponent);
        // 对比props
        patchProps(el, oldProps, newProps);
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            // 处理新props
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                // 处理老props
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function patchChildren(n1, n2, container, parentComponent) {
        // 四种情况
        // 1.新的 文本 ｜ 老的 数组
        // 2.新的 文本 ｜ 老的 文本
        // 3 新的 数组 ｜ 老的 文本
        // 4.新的 数组 ｜ 老的 数组
        const prevShapeFlag = n1.shapeFlag;
        const nextShapeFlag = n2.shapeFlag;
        const c1 = n1 && n1.children;
        const c2 = n2.children;
        // 新的是文本
        if (nextShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            if (prevShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
                // 第一种情况
                // 1.清空 prev
                unmountChildren(c1);
                // 2.设置 next text
            }
            if (c1 !== c2) {
                //  第一种 第二种都 走这里
                hostSetElementText(container, c2);
            }
        }
        else {
            // 新的是数组
            // 第三种 老的是文本
            if (prevShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                hostSetElementText(container, '');
                mountChildren(c2, container, parentComponent);
            }
        }
    }
    // 清空子节点
    function unmountChildren(children) {
        for (let i = 0, len = children.length; i < len; i++) {
            const el = children[i].el;
            // 删除
            hostRemove(el);
        }
    }
    function mountElement(vnode, container, parentComponent) {
        // 存到 vnode 上
        // const el: HTMLElement = (vnode.el = document.createElement(vnode.type))
        const el = (vnode.el = hostCreateElement(vnode.type));
        const { children, props, shapeFlag } = vnode;
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            mountChildren(vnode.children, el, parentComponent);
        }
        // props
        for (let key in props) {
            const prop = props[key];
            // if (isOn(key)) {
            //     const event = key.slice(2).toLocaleLowerCase()
            //     el.addEventListener(event, prop)
            // } else {
            //     el.setAttribute(key, prop)
            // }
            hostPatchProp(el, key, null, prop);
        }
        // container.append(el)
        hostInsert(el, container);
    }
    function mountChildren(children, container, parentComponent) {
        children.forEach((v) => {
            patch(null, v, container, parentComponent);
        });
    }
    // 处理 component
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(initialVNode, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container);
    }
    function setupRenderEffect(instance, initialVNode, container) {
        // 通过 effect 包裹 重新出发render 生成虚拟DOM
        effect(() => {
            if (!instance.isMounted) {
                // 初始化
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                // vnode => patch
                // vnode => element => mountElement
                patch(null, subTree, container, instance);
                // 组件的 所有的 element 都处理完毕
                // 将根节点的el 赋值到 当前组件的虚拟节点上
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                // 更新
                const { proxy } = instance;
                const prevTree = instance.subTree;
                const nextTree = instance.render.call(proxy);
                instance.subTree = nextTree;
                patch(prevTree, nextTree, container, instance);
            }
        });
    }
    // 处理 fragment
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2.children, container, parentComponent);
    }
    // 处理 text
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    return {
        createApp: createAppAPI(render)
    };
}

const isOn = (key) => /^on[A-Z]/.test(key);
function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevProp, nextProp) {
    if (isOn(key)) {
        const event = key.slice(2).toLocaleLowerCase();
        el.addEventListener(event, nextProp);
    }
    else {
        if (nextProp === undefined || nextProp === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextProp);
        }
    }
}
function insert(el, container) {
    container.append(el);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
});
function createApp(...args) {
    return renderer.createApp(...args);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.effect = effect;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.ref = ref;
exports.renderSlot = renderSlot;
exports.shallowReadonly = shallowReadonly;
