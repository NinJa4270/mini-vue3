const queue: any[] = []

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
    let job
    while (job = queue.shift()) {
        job && job()
    }
}

function queueFlush() {
    if (isFlushPending) return
    isFlushPending = true
    resolvedPromise.then(flushJobs)
}

export function nextTick(fn?: any) {
    return fn ? resolvedPromise.then(fn) : resolvedPromise
}