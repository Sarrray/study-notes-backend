import { GetParameterCommand, SSMClient, ParameterNotFound } from '@aws-sdk/client-ssm';
import OpenAI from 'openai';

const ssm = new SSMClient({});
let apiKey: string | null = null;
let lastFetchTime: number | null = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1時間

export const getOpenAIApiKey = async (): Promise<string> => {
    const now = Date.now();
    if (apiKey && lastFetchTime && now - lastFetchTime < CACHE_DURATION) {
        return apiKey;
    }

    try {
        const command = new GetParameterCommand({
            Name: process.env.SSM_PARAMETER_NAME,
            WithDecryption: true,
        });

        const response = await ssm.send(command);
        if (!response.Parameter?.Value) {
            throw new Error('APIキーが取得できませんでした');
        }

        apiKey = response.Parameter.Value;
        lastFetchTime = now;
        return apiKey;
    } catch (error) {
        if (error instanceof ParameterNotFound) {
            throw new Error('APIキーのパラメータが見つかりません');
        }
        throw error;
    }
};

export const openai = async () => {
    const apiKey = await getOpenAIApiKey();
    return new OpenAI({
        apiKey,
    });
};
