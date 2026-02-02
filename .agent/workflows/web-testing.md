---
description: Test web application with browser - UI, responsive, và functions
---

# Web Testing Workflow

## Step 1: Start Development Server

// turbo
```bash
cd /Users/hainc/duan/app-tts/tuyendung/frontend && npm run dev &
```

Wait for server to be ready (usually shows http://localhost:5173)

## Step 2: Navigate to Test Page

Use browser_subagent to open the page to test:
- Landing: http://localhost:5173/
- Login: http://localhost:5173/login
- Register: http://localhost:5173/register
- Dashboard: http://localhost:5173/company
- Zalo: http://localhost:5173/zalo

## Step 3: Desktop Testing (1440px)

1. Take screenshot of full page
2. Check:
   - [ ] Layout correct
   - [ ] Navigation visible
   - [ ] Content properly aligned
   - [ ] Images loaded

## Step 4: Tablet Testing (768px)

1. Resize browser to 768x1024
2. Take screenshot
3. Check:
   - [ ] Grid changes to 2 columns
   - [ ] Sidebar responsive
   - [ ] Touch targets adequate

## Step 5: Mobile Testing (375px)

1. Resize browser to 375x667
2. Take screenshot
3. Check:
   - [ ] Single column layout
   - [ ] Hamburger menu appears
   - [ ] No horizontal scroll
   - [ ] Text readable (min 14px)

## Step 6: Functional Testing

### Navigation Test
1. Click all nav links
2. Verify correct page loads
3. Check back button works

### Form Test
1. Submit empty form → Check validation
2. Input invalid data → Check error messages
3. Input valid data → Check success state

### Auth Flow Test
1. Go to /login
2. Enter credentials
3. Submit and verify redirect
4. Check session persists on refresh

## Step 7: API Integration Test

1. Open browser DevTools → Network tab
2. Perform action that calls API
3. Verify:
   - [ ] Request sent correctly
   - [ ] Response status 200
   - [ ] Data rendered properly

## Step 8: Document Results

Take final screenshots and report:
- ✅ What works
- ❌ What's broken
- 📝 Recommendations

## Quick Test URLs

| Page | URL | Expected |
|------|-----|----------|
| Landing | `/` | Hero section visible |
| Login | `/login` | Login form rendered |
| Register | `/register` | Registration form |
| Dashboard | `/company` | Company info |
| Zalo | `/zalo` | Zalo integration |
