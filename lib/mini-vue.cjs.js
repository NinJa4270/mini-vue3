'use strict';

const toDisplayString = (val) => {
    return isString(val)
        ? val
        : val == null
            ? ''
            : isArray(val) ||
                (isObject(val) &&
                    (val.toString === objectToString || !isFunction(val.toString)))
                ? JSON.stringify(val, replacer, 2)
                : String(val);
};
const replacer = (_key, val) => {
    // can't use isRef here since @vue/shared has no deps
    if (val && val.__v_isRef) {
        return replacer(_key, val.value);
    }
    else if (isMap(val)) {
        return {
            [`Map(${val.size})`]: [...val.entries()].reduce((entries, [key, val]) => {
                entries[`${key} =>`] = val;
                return entries;
            }, {})
        };
    }
    else if (isSet(val)) {
        return {
            [`Set(${val.size})`]: [...val.values()]
        };
    }
    else if (isObject(val) && !isArray(val) && !isPlainObject(val)) {
        return String(val);
    }
    return val;
};

const isObject = (val) => val !== null && typeof val === 'object';
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const isString = (val) => typeof val === 'string';
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty.call(val, key);
const EMPTY_OBJ = {};
const isArray = Array.isArray;
const isFunction = (val) => typeof val === 'function';
const objectToString = Object.prototype.toString;
const isMap = (val) => toTypeString(val) === '[object Map]';
const toTypeString = (value) => objectToString.call(value);
const isSet = (val) => toTypeString(val) === '[object Set]';
const isPlainObject = (val) => toTypeString(val) === '[object Object]';

const TO_DISPLAY_STRING = Symbol(`toDisplayString`);
// export const CREATE_ELEMENT_BLOCK = Symbol(`createElementBlock`)
const CREATE_ELEMENT_VNODE = Symbol(`createElementVNode`);
const helperNameMap = {
    [TO_DISPLAY_STRING]: `toDisplayString`,
    // [CREATE_ELEMENT_BLOCK]: `createElementBlock`,
    [CREATE_ELEMENT_VNODE]: `createElementVNode`,
};

const aliasHelper = (s) => `${helperNameMap[s]}: _${helperNameMap[s]}`;
function generate(ast) {
    const context = createCodegenContext();
    const { push } = context;
    push(`\n`);
    genFunctionPreamble(ast, context);
    const functionName = "render";
    const args = ['_ctx', '_cache'];
    const signature = args.join(', ');
    push(` function ${functionName}(${signature}) {`);
    push(`return `);
    if (ast.codegenNode) {
        genNode(ast.codegenNode, context);
    }
    else {
        push(`null`);
    }
    push(`}`);
    return {
        code: context.code
    };
}
function genFunctionPreamble(ast, context) {
    const VueBinging = `Vue`;
    const { push } = context;
    if (ast.helpers.length > 0) {
        push(`const { ${ast.helpers.map(aliasHelper).join(", ")}} = ${VueBinging} `);
    }
    push(`\n`);
    push(`return`);
}
function genNode(node, context) {
    if (!node)
        return;
    switch (node.type) {
        case 1 /* NodeTypes.TEXT */:
            genText(node, context);
            break;
        case 0 /* NodeTypes.ELEMENT */:
            genElement(node, context);
            break;
        case 3 /* NodeTypes.SIMPLE_EXPRESSION */:
            genExpression(node, context);
            break;
        case 2 /* NodeTypes.INTERPOLATION */:
            genInterpolation(node, context);
            break;
        case 5 /* NodeTypes.COMPOUND_EXPRESSION */:
            genCompoundExpression(node, context);
            break;
    }
}
// 元素类型
function genElement(node, context) {
    const { push, helper } = context;
    const { tag, children, props } = node;
    push(` ${helper(CREATE_ELEMENT_VNODE)}(`);
    genNodeList(genNullable([tag, props, children]), context);
    // genNode(children as unknown as CodegenNode, context)
    push(`)`);
}
function genNodeList(nodes, context) {
    const { push } = context;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (isString(node)) {
            push(`${node}`);
        }
        else {
            genNode(node, context);
        }
        if (i < nodes.length - 1) {
            push(", ");
        }
    }
}
function genNullable(args) {
    return args.map(arg => arg || "null");
}
// 文字类型
function genText(node, context) {
    const { push } = context;
    push(` "${node.content}"`);
}
// 插值类型
function genInterpolation(node, context) {
    const { push, helper } = context;
    push(` ${helper(TO_DISPLAY_STRING)}(`);
    genNode(node.content, context);
    push(`)`);
}
// 插值内表达式类型
function genExpression(node, context) {
    const { content } = node;
    const { push } = context;
    push(content);
}
// 复合类型
function genCompoundExpression(node, context) {
    const { push } = context;
    const { children } = node;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isString(child)) {
            push(child);
        }
        else {
            genNode(child, context);
        }
    }
}
function createCodegenContext(ast) {
    const context = {
        code: ``,
        push(code) {
            context.code += code;
        },
        helper(key) {
            return `_${helperNameMap[key]}`;
        },
    };
    return context;
}

function createRoot(children) {
    return {
        type: 4 /* NodeTypes.ROOT */,
        children,
        helpers: [],
    };
}
function createVNodeCall(context, tag, props, children) {
    if (context) {
        context.helper(CREATE_ELEMENT_VNODE);
    }
    return {
        type: 0 /* NodeTypes.ELEMENT */,
        tag,
        children,
        props
    };
}

function baseParse(content) {
    const context = createParserContext(content);
    return createRoot(parseChildren(context, []));
}
function parseChildren(context, ancestors) {
    const nodes = [];
    while (!isEnd(context, ancestors)) {
        const s = context.source;
        let node = undefined;
        if (startsWith(s, '{{')) {
            node = parseInterpolation(context);
        }
        else if (s[0] === '<') {
            if (/[a-z]/i.test(s[1])) {
                node = parseElement(context, ancestors);
            }
        }
        if (!node) {
            node = parseText(context);
        }
        nodes.push(node);
    }
    return nodes;
}
function parseText(context) {
    const endTokens = ['{{', '<'];
    let endIndex = context.source.length;
    for (let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i]);
        if (index !== -1 && endIndex > index) {
            endIndex = index;
        }
    }
    const content = parseTextData(context, endIndex);
    return {
        type: 1 /* NodeTypes.TEXT */,
        content,
    };
}
function parseTextData(context, length) {
    const content = context.source.slice(0, length);
    advanceBy(context, length);
    return content;
}
// 处理元素
function parseElement(context, ancestors) {
    // <div></div>
    // 解析tag
    const element = parseTag(context, 0 /* TagType.Start */);
    ancestors.push(element); // 收集tag栈
    const children = parseChildren(context, ancestors);
    element.children = children;
    ancestors.pop(); // 弹出tag栈
    // 相同
    if (startsWithEndTagOpen(context.source, element.tag)) {
        // 删除结束
        parseTag(context, 1 /* TagType.End */);
    }
    else {
        throw new Error(`Element is missing end tag. ${element.tag}`);
    }
    return element;
}
// 当前children 是否结束
function isEnd(context, ancestors) {
    const s = context.source;
    // 遇到结束标签
    // if (parentTag && s.startsWith(`</${parentTag}>`)) {
    //     return true
    // }
    if (startsWith(s, '</')) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i].tag;
            // </div>
            if (startsWithEndTagOpen(s, tag)) {
                return true;
            }
        }
    }
    // source 没有值 结束 
    return !s;
}
function parseTag(context, type) {
    const match = /^<\/?([a-z]*)/i.exec(context.source); // 结束
    const tag = match[1];
    // 删除解析结果
    advanceBy(context, match[0].length); // <div
    advanceBy(context, 1); // >
    if (type === 1 /* TagType.End */) {
        return;
    }
    return {
        type: 0 /* NodeTypes.ELEMENT */,
        tag,
        tagType: 0 /* ElementTypes.ELEMENT */,
        children: [],
        props: null,
        codegenNode: undefined
    };
}
// 处理插值
function parseInterpolation(context) {
    // {{  message}}
    // delimiters
    const open = "{{";
    const close = "}}";
    const closeIndex = context.source.indexOf(close, open.length);
    advanceBy(context, open.length);
    const rawContentLength = closeIndex - open.length;
    // const rawContent = context.source.slice(0, rawContentLength)
    const rawContent = parseTextData(context, rawContentLength);
    const content = rawContent.trim();
    advanceBy(context, close.length);
    return {
        type: 2 /* NodeTypes.INTERPOLATION */,
        content: {
            type: 3 /* NodeTypes.SIMPLE_EXPRESSION */,
            content
        }
    };
}
function advanceBy(context, numberOfCharacters) {
    const { source } = context;
    context.source = source.slice(numberOfCharacters);
}
function createParserContext(content) {
    return {
        source: content
    };
}
function startsWithEndTagOpen(source, tag) {
    return startsWith(source, '<') && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase();
}
function startsWith(source, searchString) {
    return source.startsWith(searchString);
}

function transform(root, options) {
    const context = createTransformContext(root, options);
    // 遍历 - 深度优先
    traverseNode(root, context);
    createRootCodegen(root);
    root.helpers = [...context.helpers.keys()];
}
function createRootCodegen(root) {
    const child = root.children[0];
    if (child.type === 0 /* NodeTypes.ELEMENT */) {
        root.codegenNode = child.codegenNode;
    }
    else {
        root.codegenNode = root.children[0];
    }
}
function traverseNode(node, context) {
    const { nodeTransforms } = context;
    // 修改值
    const exitFns = []; // 退出时 需要执行的插件
    for (let i = 0; i < nodeTransforms.length; i++) {
        const onExit = nodeTransforms[i](node, context);
        if (onExit)
            exitFns.push(onExit);
    }
    switch (node.type) {
        case 2 /* NodeTypes.INTERPOLATION */:
            context.helper(TO_DISPLAY_STRING);
            break;
        case 4 /* NodeTypes.ROOT */:
        case 0 /* NodeTypes.ELEMENT */:
            // context.helper(CREATE_ELEMENT_BLOCK)
            traverseChildren(node, context);
            break;
    }
    let i = exitFns.length;
    while (i--) {
        exitFns[i]();
    }
}
function traverseChildren(parent, context) {
    const children = parent.children;
    if (children) {
        for (let i = 0, len = children.length; i < len; i++) {
            const child = children[i];
            traverseNode(child, context);
        }
    }
}
function createTransformContext(root, { nodeTransforms = [] }) {
    const context = {
        nodeTransforms,
        helpers: new Map(),
        helper(name) {
            const count = context.helpers.get(name) || 0;
            context.helpers.set(name, count + 1);
            return name;
        },
    };
    return context;
}

const transformElement = (node, context) => {
    return () => {
        if (node.type === 0 /* NodeTypes.ELEMENT */) {
            const { tag, children, props } = node;
            // tag
            let vnodeTag = `'${tag}'`;
            let vnodeChildren = children[0];
            node.codegenNode = createVNodeCall(context, vnodeTag, props, vnodeChildren);
        }
    };
};

const transformExpression = (node, context) => {
    if (node.type === 2 /* NodeTypes.INTERPOLATION */) {
        node.content = processExpression(node.content);
    }
};
function processExpression(node) {
    node.content = `_ctx.${node.content}`;
    return node;
}

function isText(node) {
    return node.type === 1 /* NodeTypes.TEXT */ || node.type === 2 /* NodeTypes.INTERPOLATION */;
}

const transformText = (node, context) => {
    return () => {
        if (node.type === 0 /* NodeTypes.ELEMENT */) {
            const children = node.children;
            let currentContainer = undefined;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                // 判断是否是 text类型或 插值类型
                if (isText(child)) {
                    // 查找他下一个节点是否需要联合
                    for (let j = i + 1; j < children.length; j++) {
                        const next = children[j];
                        if (isText(next)) {
                            if (!currentContainer) {
                                currentContainer = children[i] = {
                                    type: 5 /* NodeTypes.COMPOUND_EXPRESSION */,
                                    children: [child]
                                };
                            }
                            currentContainer.children.push(` + `, next);
                            children.splice(j, 1); // 删除
                            j--; // 继续遍历
                        }
                        else {
                            currentContainer = undefined;
                            break;
                        }
                    }
                }
            }
        }
    };
};

function baseCompile(template) {
    const ast = baseParse(template);
    transform(ast, {
        nodeTransforms: [transformExpression, transformElement, transformText]
    });
    return generate(ast);
}

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const shapeFlag = isString(type) ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
    const vnode = {
        type,
        props,
        children,
        key: (props === null || props === void 0 ? void 0 : props.key) || null,
        el: null,
        shapeFlag,
        component: null,
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
function isSameVNodeType(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key;
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
    $slots: (i) => i.slots,
    $props: (i) => i.props
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

let compiler;
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
        isMounted: false,
        update: null,
        next: null
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
    if (compiler && !component.render) {
        if (component.template) {
            component.render = compiler(component.template);
        }
    }
    instance.render = component.render;
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}
function registerRuntimeCompiler(_compiler) {
    compiler = _compiler;
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

function shouldUpdateComponent(prevVNode, nextVNode) {
    const { props: prevProps } = prevVNode;
    const { props: nextProps } = nextVNode;
    for (const key in nextProps) {
        if (nextProps[key] !== prevProps[key]) {
            return true;
        }
    }
    return false;
}

const queue = [];
let isFlushPending = false;
const resolvedPromise = Promise.resolve();
function queueJob(job) {
    // 添加进队列
    if (!queue.includes(job)) {
        queue.push(job);
    }
    queueFlush();
}
function flushJobs() {
    isFlushPending = false;
    let job;
    while (job = queue.shift()) {
        job && job();
    }
}
function queueFlush() {
    if (isFlushPending)
        return;
    isFlushPending = true;
    resolvedPromise.then(flushJobs);
}
function nextTick(fn) {
    return fn ? resolvedPromise.then(fn) : resolvedPromise;
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options;
    function render(vnode, container) {
        // patch
        patch(null, vnode, container, null, null);
    }
    function patch(n1, n2, container, anchor, parentComponent) {
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
                    processElement(n1, n2, container, anchor, parentComponent);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, anchor, parentComponent);
                }
                break;
        }
    }
    // 处理 element
    function processElement(n1, n2, container, anchor, parentComponent) {
        if (!n1) {
            // init 
            mountElement(n2, container, anchor, parentComponent);
        }
        else {
            // update
            patchElement(n1, n2, container, anchor, parentComponent);
        }
    }
    // 更新 element
    function patchElement(n1, n2, container, anchor, parentComponent) {
        // 对比
        const el = (n2.el = n1.el);
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        // 对比children
        patchChildren(n1, n2, el, anchor, parentComponent);
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
    function patchChildren(n1, n2, container, anchor, parentComponent) {
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
            else {
                // 第四种 数组对比
                patchKeyedChildren(c1, c2, container, anchor, parentComponent);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentAnchor, parentComponent) {
        /**
         *  [i]  [e1]
         *  (a b) c
         *  (a b) d e
         *         [e2]
         *
         * */
        let i = 0;
        const l2 = c2.length;
        let e1 = c1.length - 1;
        let e2 = l2 - 1;
        // 通过双端对比 缩小中间范围
        // 左侧遍历 (通过移动 i) 对相同节点进行再次patch 遇到不同节点时推出 
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVNodeType(n1, n2)) {
                // 相同节点 继续递归调用 patch
                patch(n1, n2, container, parentAnchor, parentComponent);
            }
            else {
                break;
            }
            i++;
        }
        // 右侧遍历 (通过移动 e1,e2)
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVNodeType(n1, n2)) {
                // 相同节点 继续递归调用 patch
                patch(n1, n2, container, parentAnchor, parentComponent);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        if (i > e1) {
            if (i <= e2) {
                // 新的比老的长 新增节点
                const nextPos = e2 + 1;
                console.log('%crenderer.ts line:176 新增', 'color: #007acc;');
                // 设置 anchor 锚点 将元素插入的 anchor之前
                const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
                while (i <= e2) {
                    patch(null, c2[i], container, anchor, parentComponent);
                    i++;
                }
            }
        }
        else if (i > e2) {
            //老的比新的长 删除节点
            while (i <= e1) {
                unmount(c1[i]);
                i++;
            }
        }
        else {
            // 中间对比
            console.log('%crenderer.ts line:196 中间对比', 'color: #007acc;');
            const s1 = i; // 老节点的开始
            const s2 = i; // 新节点的开始
            // 优化 是否需要移动 是否需要生成最长递增子序列
            let moved = false; // 标识 是否需要移动
            let maxNewIndexSoFar = 0;
            // 优化
            // 当 patched 等于 toBePatched
            // 说明新节点已经被全部更新完毕 此时老节点中还有剩余 则不需要再查找 直接删除
            let patched = 0; // 每次新节点patch 进行加1 
            const toBePatched = e2 - s2 + 1; // 新节点中 需要被pactch的总数量 
            // 优化 用于求最长递增子序列 
            const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
            // 优化 映射表 方便从新元素中查找旧元素
            const keyToNewIndexMap = new Map();
            // 遍历新的数组 进行映射缓存
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i];
                keyToNewIndexMap.set(nextChild.key, i);
            }
            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                if (patched >= toBePatched) { // 新节点 已经全部更细完毕 删除剩余老节点
                    console.log('%crenderer.ts line:218 提前删除', 'color: #007acc;');
                    unmount(prevChild);
                    continue;
                }
                let newIndex;
                // 两种方案 1.通过key去查找缓存 2.直接遍历
                if (prevChild.key != null) {
                    console.log('%crenderer.ts line:223 通过key删除', 'color: #007acc;');
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    console.log('%crenderer.ts line:226 通过遍历删除', 'color: #007acc;');
                    for (let j = s2; j <= e2; j++) {
                        if (isSameVNodeType(prevChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    // 当前旧节点 一定不存在新节点中 需要删除
                    unmount(prevChild);
                }
                else {
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    // 旧节点 存在与新节点中
                    newIndexToOldIndexMap[newIndex - s2] = i + 1; // 这里不能让 i为0 为0在newIndexToOldIndexMap是有意义的 所以强制+1来保存
                    patch(prevChild, c2[newIndex], container, null, parentComponent);
                    patched++;
                }
            }
            // 生成最长递增子序列
            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
            console.log('%crenderer.ts line:251 increasingNewIndexSequence', 'color: #007acc;', increasingNewIndexSequence);
            // 遍历 旧的节点 和 最长递增子序列
            // 正向遍历并不能保证正确的顺序
            // let j = 0
            // for (let i = 0; i < toBePatched; i++) {
            //     if (i !== increasingNewIndexSequence[j]) {
            //         console.log('%crenderer.ts line:256 移动位置', 'color: #007acc;', i);
            //     } else {
            //         j++
            //     }
            // }
            let j = increasingNewIndexSequence.length - 1;
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2; // 当前需要处理的节点索引
                const nextChild = c2[nextIndex]; // 需要处理的节点
                //              当前节点的下一个        大于长度
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor; // 对应的锚点
                if (newIndexToOldIndexMap[i] === 0) {
                    // 标识需要创建新节点
                    patch(null, nextChild, container, anchor, parentComponent);
                }
                else if (moved) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        console.log('%crenderer.ts line:256 移动位置', 'color: #007acc;', i);
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function unmount(vnode) {
        hostRemove(vnode.el);
    }
    // 清空子节点
    function unmountChildren(children) {
        for (let i = 0, len = children.length; i < len; i++) {
            const child = children[i];
            // 删除
            unmount(child);
        }
    }
    function mountElement(vnode, container, anchor, parentComponent) {
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
        hostInsert(el, container, anchor);
    }
    function mountChildren(children, container, parentComponent) {
        children.forEach((v) => {
            patch(null, v, container, null, parentComponent);
        });
    }
    // 处理 component
    function processComponent(n1, n2, container, anchor, parentComponent) {
        if (!n1) {
            // init
            mountComponent(n2, container, anchor, parentComponent);
        }
        else {
            // update
            updateComponent(n1, n2);
        }
    }
    // 更新 component
    function updateComponent(n1, n2) {
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) { // 判断当前组件是否需要更新
            // 调用组件的 render 重新生成vnode
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            instance.vnode = n2;
        }
    }
    // 挂载 component
    function mountComponent(initialVNode, container, anchor, parentComponent) {
        const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent));
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container, anchor);
    }
    function setupRenderEffect(instance, initialVNode, container, anchor) {
        // 通过 effect 包裹 重新出发render 生成虚拟DOM
        instance.update = effect(() => {
            if (!instance.isMounted) {
                // 初始化
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy, proxy));
                // vnode => patch
                // vnode => element => mountElement
                patch(null, subTree, container, anchor, instance);
                // 组件的 所有的 element 都处理完毕
                // 将根节点的el 赋值到 当前组件的虚拟节点上
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                // 更新
                console.log('%crenderer.ts line:384 update', 'color: #007acc;', instance);
                // 更新组件实例的属性
                // 先更新组件的props 组件才能拿到最新的props
                // 先拿到更新前后的虚拟节点 
                const { next, vnode } = instance;
                if (next) {
                    //  更新真实dom
                    next.el = vnode.el;
                    // 更新属性
                    updateComponentPreRender(instance, next);
                }
                const { proxy } = instance;
                const prevTree = instance.subTree;
                const nextTree = instance.render.call(proxy);
                instance.subTree = nextTree;
                patch(prevTree, nextTree, container, anchor, instance);
            }
        }, {
            scheduler: () => queueJob(instance.update)
        });
    }
    // 更新组件实例的属性
    function updateComponentPreRender(instance, nextVNode) {
        instance.vnode = nextVNode;
        instance.next = null;
        instance.props = nextVNode.props;
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
// 生成最长递增子序列
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
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
function insert(el, parent, anchor) {
    // parent.append(el)
    parent.insertBefore(el, anchor);
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

var runtimeDom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createApp: createApp,
    h: h,
    renderSlot: renderSlot,
    createTextVNode: createTextVNode,
    createElementVNode: createVNode,
    registerRuntimeCompiler: registerRuntimeCompiler,
    getCurrentInstance: getCurrentInstance,
    provide: provide,
    inject: inject,
    createRenderer: createRenderer,
    nextTick: nextTick,
    toDisplayString: toDisplayString
});

function compileToFunction(template) {
    const { code } = baseCompile(template);
    const render = new Function("Vue", code)(runtimeDom);
    return render;
}
registerRuntimeCompiler(compileToFunction);

exports.createApp = createApp;
exports.createElementVNode = createVNode;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.effect = effect;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.nextTick = nextTick;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.ref = ref;
exports.registerRuntimeCompiler = registerRuntimeCompiler;
exports.renderSlot = renderSlot;
exports.shallowReadonly = shallowReadonly;
exports.toDisplayString = toDisplayString;
