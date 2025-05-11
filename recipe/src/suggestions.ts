import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { openai } from './openai';
import { getCorsHeaders, handleCorsPreflight } from './utils/cors';

export const suggestRecipes = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const preflight = handleCorsPreflight(event);
    if (preflight) return preflight;

    const headers = getCorsHeaders();

    try {
        const body = JSON.parse(event.body || '{}');
        const ingredients: string[] = Array.isArray(body.ingredients) ? body.ingredients : [];
        const constraints: string | null = body.constraints || null;
        if (ingredients.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: '材料が指定されていません' }),
            };
        }

        // OpenAIのトークン数を考慮して、長すぎる場合はエラーを返す
        if (ingredients.join().length > 500 || (constraints?.length ?? 0) > 500) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: '材料が多すぎ・または制約が長すぎます' }),
            };
        }

        const prompt = `
あなたは家庭料理の専門家です。

ユーザーの入力をもとに、作れる家庭料理の候補を1～5つ考えてください。
全ての材料を使う必要はありませんが、主要な材料はなるべく活用してください。
メイン料理・スープ・ご飯もの・副菜などジャンルが被らないようにしてください。

出力は **必ず以下のJSON形式で** 返してください。
余計な説明や文章は不要です。

{
  "candidates": ["料理名1", "料理名2", "料理名3"]
}
`;

        const openaiClient = await openai();
        const response = await openaiClient.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: prompt,
                },
                {
                    role: 'user',
                    content:
                        `材料：${ingredients}\n\n` +
                        (constraints ? `以下の制約も考慮してください：\n${constraints}` : ''),
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 500,
        });

        const recipeSuggestions = JSON.parse(response.choices[0].message?.content || '{}');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(recipeSuggestions),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: '提案取得中にエラーが発生しました' }),
        };
    }
};
