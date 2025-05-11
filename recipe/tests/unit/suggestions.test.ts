import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { suggestRecipes } from '../../src/suggestions';
import { expect, describe, it } from '@jest/globals';

describe('Unit test for suggestRecipes handler', function () {
    it('verifies successful response with valid ingredients', async () => {
        const event: APIGatewayProxyEvent = {
            httpMethod: 'post',
            body: JSON.stringify({
                ingredients: ['豚肉', '玉ねぎ', '人参'],
                constraints: '簡単に作れる料理',
            }),
            headers: {},
            isBase64Encoded: false,
            multiValueHeaders: {},
            multiValueQueryStringParameters: {},
            path: '/suggestions',
            pathParameters: {},
            queryStringParameters: {},
            requestContext: {
                accountId: '123456789012',
                apiId: '1234',
                authorizer: {},
                httpMethod: 'post',
                identity: {
                    accessKey: '',
                    accountId: '',
                    apiKey: '',
                    apiKeyId: '',
                    caller: '',
                    clientCert: {
                        clientCertPem: '',
                        issuerDN: '',
                        serialNumber: '',
                        subjectDN: '',
                        validity: { notAfter: '', notBefore: '' },
                    },
                    cognitoAuthenticationProvider: '',
                    cognitoAuthenticationType: '',
                    cognitoIdentityId: '',
                    cognitoIdentityPoolId: '',
                    principalOrgId: '',
                    sourceIp: '',
                    user: '',
                    userAgent: '',
                    userArn: '',
                },
                path: '/suggestions',
                protocol: 'HTTP/1.1',
                requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
                requestTimeEpoch: 1428582896000,
                resourceId: '123456',
                resourcePath: '/suggestions',
                stage: 'dev',
            },
            resource: '',
            stageVariables: {},
        };
        const result: APIGatewayProxyResult = await suggestRecipes(event);

        expect(result.statusCode).toEqual(200);
        const body = JSON.parse(result.body);
        expect(body).toHaveProperty('candidates');
        expect(Array.isArray(body.candidates)).toBe(true);
    });

    it('verifies error response with empty ingredients', async () => {
        const event: APIGatewayProxyEvent = {
            httpMethod: 'post',
            body: JSON.stringify({
                ingredients: [],
                constraints: '簡単に作れる料理',
            }),
            headers: {},
            isBase64Encoded: false,
            multiValueHeaders: {},
            multiValueQueryStringParameters: {},
            path: '/suggestions',
            pathParameters: {},
            queryStringParameters: {},
            requestContext: {
                accountId: '123456789012',
                apiId: '1234',
                authorizer: {},
                httpMethod: 'post',
                identity: {
                    accessKey: '',
                    accountId: '',
                    apiKey: '',
                    apiKeyId: '',
                    caller: '',
                    clientCert: {
                        clientCertPem: '',
                        issuerDN: '',
                        serialNumber: '',
                        subjectDN: '',
                        validity: { notAfter: '', notBefore: '' },
                    },
                    cognitoAuthenticationProvider: '',
                    cognitoAuthenticationType: '',
                    cognitoIdentityId: '',
                    cognitoIdentityPoolId: '',
                    principalOrgId: '',
                    sourceIp: '',
                    user: '',
                    userAgent: '',
                    userArn: '',
                },
                path: '/suggestions',
                protocol: 'HTTP/1.1',
                requestId: 'c6af9ac6-7b61-11e6-9a41-93e8deadbeef',
                requestTimeEpoch: 1428582896000,
                resourceId: '123456',
                resourcePath: '/suggestions',
                stage: 'dev',
            },
            resource: '',
            stageVariables: {},
        };
        const result: APIGatewayProxyResult = await suggestRecipes(event);

        expect(result.statusCode).toEqual(400);
        expect(result.body).toEqual(JSON.stringify({ error: '材料が指定されていません' }));
    });
});
