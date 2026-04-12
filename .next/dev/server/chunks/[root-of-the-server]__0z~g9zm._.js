module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/pages/api/rooms/create.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$upstash$2f$redis__$5b$external$5d$__$2840$upstash$2f$redis$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$upstash$2f$redis$29$__ = __turbopack_context__.i("[externals]/@upstash/redis [external] (@upstash/redis, esm_import, [project]/node_modules/@upstash/redis)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$upstash$2f$redis__$5b$external$5d$__$2840$upstash$2f$redis$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$upstash$2f$redis$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$upstash$2f$redis__$5b$external$5d$__$2840$upstash$2f$redis$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$upstash$2f$redis$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const redis = new __TURBOPACK__imported__module__$5b$externals$5d2f40$upstash$2f$redis__$5b$external$5d$__$2840$upstash$2f$redis$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$upstash$2f$redis$29$__["Redis"]({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
});
const WORDS = [
    'QWER',
    'TYUI',
    'UIOP',
    'ASDF',
    'HJKL',
    'ZXCV',
    'VBNM',
    'GOAT',
    'NEOR',
    'SAMZ',
    'KAMI',
    'ROOM'
];
function genCode() {
    return WORDS[Math.floor(Math.random() * WORDS.length)] + '-' + Math.floor(10 + Math.random() * 90);
}
async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { name, topic, visibility, createdBy } = req.body;
    if (!name || !createdBy) return res.status(400).json({
        error: 'name and createdBy required'
    });
    let code = genCode();
    let attempts = 0;
    while(await redis.exists(`room:${code}`) && attempts++ < 20)code = genCode();
    const room = {
        code,
        name,
        topic: topic || '',
        visibility: visibility || 'public',
        createdBy,
        members: 0,
        createdAt: Date.now()
    };
    await redis.hset(`room:${code}`, room);
    if (visibility === 'public') await redis.sadd('public_rooms', code);
    res.status(201).json({
        ...room,
        messages: []
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0z~g9zm._.js.map