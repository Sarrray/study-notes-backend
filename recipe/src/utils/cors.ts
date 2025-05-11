export function getCorsHeaders(): Record<string, string> {
    let origin = process.env.ALLOWED_ORIGIN;

    if (!origin) {
        if (process.env.NODE_ENV === 'production') {
            console.error('CORS: ALLOWED_ORIGIN が未設定です。');
            throw new Error('CORS origin not configured.');
        } else {
            origin = '*';
        }
    }

    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
}

export function handleCorsPreflight(event: { httpMethod: string }) {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: '',
        };
    }
    return null; // 通常リクエストへ継続
}
