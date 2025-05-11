import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { openai } from './openai';
import { getCorsHeaders, handleCorsPreflight } from './utils/cors';

export const getRecipeDetail = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const preflight = handleCorsPreflight(event);
    if (preflight) return preflight;

    const headers = getCorsHeaders();

    try {
        const body = JSON.parse(event.body || '{}');
        const recipeName = body.recipeName?.trim();
        if (!recipeName) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: '料理名が指定されていません' }),
            };
        }

        // OpenAIのトークン数を考慮して、長すぎる場合はエラーを返す
        if (recipeName.length > 100) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: '料理名が長すぎます' }),
            };
        }

        const prompt = `
あなたは家庭料理の専門家です。

以下の料理について、レシピの詳細情報を **必ず次のJSON形式で** 出力してください。
余計な説明やコメントは一切不要です。

{
  "title": "料理名",
  "ingredients": ["材料1", "材料2", "材料3"],
  "steps": ["手順1", "手順2", "手順3"]
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
                    content: `料理名：${recipeName}`,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0,
            max_tokens: 1000,
        });

        const recipeDetail = JSON.parse(response.choices[0].message?.content || '{}');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(recipeDetail),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'レシピ詳細取得中にエラーが発生しました' }),
        };
    }
};
