const queue: any[] = []
const activePostFlushCbs: any[] = []

let isFlushPending = false

const resolvedPromise = Promise.resolve()

export function queueJob(job: any) {
    // 添加进队列
    if (!queue.includes(job)) {
        queue.push(job)
    }
    queueFlush()
}

function flushJobs() {
    isFlushPending = false
    flushPostFlushCbs()
    let job
    while (job = queue.shift()) {
        job && job()
    }
}

function flushPostFlushCbs() {
    for (let i = 0; i < activePostFlushCbs.length; i++) {
        activePostFlushCbs[i]()
    }
}

export function queuePostFlushCb(cb: any) {
    activePostFlushCbs.push(cb)
    queueFlush()
}



function queueFlush() {
    if (isFlushPending) return
    isFlushPending = true
    resolvedPromise.then(flushJobs)
}

export function nextTick(fn?: any) {
    return fn ? resolvedPromise.then(fn) : resolvedPromise
}