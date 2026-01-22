# 🚀 Quick Setup Guide - DSA Question System

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or using Neon/Supabase)
- OpenAI API account
- RapidAPI account (for Judge0)

## Step-by-Step Setup

### 1️⃣ Get Your API Keys

#### OpenAI API Key
1. Visit https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Give it a name (e.g., "E-Learning DSA")
5. Copy the key (starts with `sk-proj-...`)
6. **Save it immediately** - you won't see it again!

**Cost Estimate**: ~$0.01-0.05 per question generated

#### Judge0 API Key (via RapidAPI)
1. Visit https://rapidapi.com/judge0-official/api/judge0-ce
2. Sign up/Sign in to RapidAPI
3. Click "Subscribe to Test" or choose a plan:
   - **Free Plan**: 50 requests/day (good for testing)
   - **Basic Plan**: $5/month - 500 requests/day
   - **Pro Plan**: $15/month - 5000 requests/day
4. After subscribing, go to "Endpoints" tab
5. Copy your **X-RapidAPI-Key** from the code snippets

### 2️⃣ Configure Environment Variables

Create `.env.local` file in your project root:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Edit `.env.local` and add your keys:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-actual-key-here

# Judge0 Configuration  
JUDGE0_API_KEY=your-rapidapi-key-here
JUDGE0_HOST=judge0-ce.p.rapidapi.com

# Your existing env variables stay the same
# DATABASE_URL=...
# CLERK_PUBLISHABLE_KEY=...
# etc.
```

### 3️⃣ Update Database Schema

Run the migration to create new tables:

```bash
# Generate migration files
npx drizzle-kit generate

# Apply migrations to database
npx drizzle-kit migrate

# Or if you're using push (for development)
npx drizzle-kit push
```

**New tables created:**
- `dsa_questions` - User-specific DSA questions
- `dsa_submissions` - Code submission history
- `user_dsa_progress` - User progress tracking

### 4️⃣ Verify Setup

Start your development server:

```bash
npm run dev
```

Visit http://localhost:3000

### 5️⃣ Test the APIs

#### Test Question Generation
```bash
curl -X POST http://localhost:3000/api/dsa/generate-question \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user_123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "question": {
    "id": 1,
    "userId": "test_user_123",
    "title": "Some DSA Question",
    "difficulty": "easy",
    ...
  }
}
```

#### Test Code Submission
```bash
curl -X POST http://localhost:3000/api/dsa/submit-code \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "questionId": 1,
    "code": "def solution(arr):\n    return len(arr)",
    "language": "python"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "submission": {
    "status": "accepted",
    "testCasesPassed": 5,
    "totalTestCases": 5
  },
  ...
}
```

## 🔍 Troubleshooting

### OpenAI API Issues

**Error: "OpenAI API key not configured"**
- ✅ Check `.env.local` file exists
- ✅ Verify `OPENAI_API_KEY` is set correctly
- ✅ Restart dev server after adding env vars
- ✅ No quotes around the key value

**Error: "Incorrect API key provided"**
- ✅ Key should start with `sk-proj-`
- ✅ Copy-paste the entire key
- ✅ Check for extra spaces

**Error: "You exceeded your current quota"**
- ⚠️ Add payment method to OpenAI account
- ⚠️ Check billing limits at https://platform.openai.com/account/billing

### Judge0 API Issues

**Error: "Judge0 API key not configured"**
- ✅ Check `.env.local` has `JUDGE0_API_KEY`
- ✅ Verify `JUDGE0_HOST=judge0-ce.p.rapidapi.com`
- ✅ Restart dev server

**Error: 403 Forbidden**
- ✅ Verify you're subscribed to Judge0 on RapidAPI
- ✅ Check subscription is active
- ✅ API key is correct (from RapidAPI dashboard)

**Error: 429 Too Many Requests**
- ⚠️ You've hit the daily limit
- ⚠️ Upgrade your RapidAPI plan
- ⚠️ Wait until next day for reset

### Database Issues

**Error: "relation 'dsa_questions' does not exist"**
```bash
# Run migrations again
npx drizzle-kit generate
npx drizzle-kit migrate
```

**Error: "column does not exist"**
```bash
# Drop all tables and recreate (⚠️ DEVELOPMENT ONLY)
npx drizzle-kit drop
npx drizzle-kit push
```

## 📊 Usage Limits & Costs

### OpenAI API
- **Free Trial**: $5 credit (usually ~500 questions)
- **Pay-as-you-go**: ~$0.01-0.05 per question
- **Monthly Budget**: Set limits in OpenAI dashboard

### Judge0 (RapidAPI)
| Plan | Cost | Requests/Day | Best For |
|------|------|--------------|----------|
| Free | $0 | 50 | Testing |
| Basic | $5/mo | 500 | Small projects |
| Pro | $15/mo | 5000 | Production |

**Cost per submission**: 1 request per test case
- 5 test cases = 5 requests
- Plan accordingly!

## 🎯 Next Steps

### For Development
1. Test all API endpoints
2. Verify question generation quality
3. Test code execution with different languages
4. Check user progress tracking

### For Production
1. Set up API monitoring
2. Configure rate limiting
3. Add error tracking (Sentry, etc.)
4. Set up cost alerts for OpenAI & RapidAPI
5. Implement caching for repeated submissions

### Building the UI
Example components to create:
- `QuestionGenerator.tsx` - Generate new questions
- `CodeEditor.tsx` - Monaco editor for coding
- `TestResults.tsx` - Display submission results
- `ProgressDashboard.tsx` - Show user stats
- `QuestionList.tsx` - Browse user's questions

**Use the helper client:**
```typescript
import { dsaApi } from '@/lib/dsa-client';

// Generate question
const { question } = await dsaApi.generateQuestion(userId);

// Submit code
const result = await dsaApi.submitCode({
  userId,
  questionId,
  code,
  language: 'python'
});
```

## 📚 Additional Resources

- [DSA Feature Documentation](./DSA_FEATURE_README.md) - Complete feature docs
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Judge0 API Docs](https://ce.judge0.com/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)

## 🆘 Need Help?

### Common Questions

**Q: Can I use a different code execution service?**
A: Yes! Modify `/api/dsa/submit-code/route.ts` to use alternatives like Piston API, AWS Lambda, etc.

**Q: Can I use a different AI model?**
A: Yes! The code uses OpenAI but can be adapted for Claude, Gemini, or local models like Llama.

**Q: How do I limit API costs?**
A: 
- Set monthly budgets in OpenAI dashboard
- Use RapidAPI free tier for testing
- Cache generated questions
- Implement rate limiting per user

**Q: Questions aren't personalized enough?**
A: Adjust the prompt in `generate-question/route.ts` and tune the difficulty/category selection logic.

**Q: How do I add more programming languages?**
A: Add language IDs in `submit-code/route.ts` LANGUAGE_IDS object. See [Judge0 languages](https://ce.judge0.com/#statuses-and-languages-language).

## ✅ Setup Checklist

- [ ] Node.js and npm installed
- [ ] Database configured
- [ ] OpenAI API key obtained
- [ ] Judge0/RapidAPI subscription active
- [ ] `.env.local` created with both keys
- [ ] Database migrations run
- [ ] Dev server started
- [ ] Test API calls successful
- [ ] Ready to build UI components!

---

**🎉 You're all set!** Start building your personalized DSA learning platform.
