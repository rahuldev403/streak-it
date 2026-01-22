# Azure OpenAI Setup Guide

This application has been configured to use Azure OpenAI API instead of the standard OpenAI API for question generation.

## Required Environment Variables

Add the following variables to your `.env` file:

```bash
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
AZURE_OPENAI_API_VERSION=2024-08-01-preview
```

## How to Get Azure OpenAI Credentials

### 1. Create Azure OpenAI Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Azure OpenAI"
4. Click "Create" and fill in:
   - **Subscription**: Your Azure subscription
   - **Resource group**: Create new or use existing
   - **Region**: Choose a region (e.g., East US, West Europe)
   - **Name**: Your resource name (e.g., `my-openai-resource`)
   - **Pricing tier**: Select appropriate tier

### 2. Deploy a Model

1. Once resource is created, go to **Azure OpenAI Studio**
2. Navigate to **Deployments** section
3. Click **Create new deployment**
4. Select:
   - **Model**: `gpt-4o` or `gpt-4o-mini`
   - **Deployment name**: `gpt-4o` (or custom name)
   - **Version**: Latest available
5. Click **Create**

### 3. Get Your Credentials

#### API Key:

1. In Azure Portal, go to your OpenAI resource
2. Click on **Keys and Endpoint** in left sidebar
3. Copy **KEY 1** or **KEY 2**

#### Endpoint:

- Format: `https://YOUR-RESOURCE-NAME.openai.azure.com/`
- Example: `https://my-openai-resource.openai.azure.com/`

#### API Version:

- Use: `2024-08-01-preview` (or latest stable version)
- Check [Azure OpenAI REST API reference](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference) for latest version

### 4. Update .env File

```bash
AZURE_OPENAI_API_KEY=abc123xyz789...
AZURE_OPENAI_ENDPOINT=https://my-openai-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
AZURE_OPENAI_API_VERSION=2024-08-01-preview
```

## Features Using Azure OpenAI

The following features now use Azure OpenAI:

1. **DSA Question Generation** (`/api/dsa/generate-question`)
   - Generates personalized coding questions
   - Uses direct REST API calls

2. **CS Fundamentals Questions** (`/api/cs-fundamentals/generate`)
   - Generates MCQ questions for DBMS, OS, Networks, OOP
   - Uses OpenAI SDK with Azure configuration

3. **Bulk DSA Generation** (`/api/dsa/generate-ai`)
   - Generates multiple DSA questions
   - Uses OpenAI SDK with Azure configuration

## Benefits of Azure OpenAI

✅ **Enterprise-grade security**: Data stays in your Azure region  
✅ **SLA guarantees**: 99.9% uptime  
✅ **Cost management**: Better control with Azure billing  
✅ **Compliance**: GDPR, HIPAA, SOC 2 certified  
✅ **Network security**: Use with private endpoints and VNets  
✅ **No rate limits**: Configurable throughput

## Pricing

Azure OpenAI pricing varies by region and model. Check current rates:

- [Azure OpenAI Pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/)

Example costs (approximate):

- **GPT-4o**: ~$0.005 per 1K input tokens, ~$0.015 per 1K output tokens
- **GPT-4o-mini**: ~$0.0001 per 1K input tokens, ~$0.0004 per 1K output tokens

## Troubleshooting

### Error: "Azure OpenAI API configuration missing"

- Ensure all environment variables are set correctly
- Verify endpoint URL format (must end with `/`)
- Check if deployment name matches in Azure

### Error: "Resource not found"

- Verify deployment name matches exactly
- Check API version is correct
- Ensure model is deployed in Azure OpenAI Studio

### Error: "Access denied"

- Verify API key is correct
- Check Azure resource access permissions
- Ensure subscription is active

### Rate Limiting

If you encounter rate limits:

1. Go to Azure Portal → Your OpenAI Resource
2. Navigate to **Model deployments**
3. Increase **Tokens per Minute (TPM)** quota
4. Request quota increase if needed

## Migration from Standard OpenAI

The previous `OPENAI_API_KEY` is no longer used. All question generation now uses Azure OpenAI endpoints.

## Additional Resources

- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Azure OpenAI Quickstart](https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart)
- [Azure OpenAI REST API Reference](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference)
