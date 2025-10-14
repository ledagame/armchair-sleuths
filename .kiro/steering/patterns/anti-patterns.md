---
name: anti-patterns
description: Collection of anti-patterns to avoid. Records patterns that caused problems in past projects.
inclusion: always
---

# Anti-Patterns (Patterns to Avoid)

This document records patterns that caused problems in past projects. Always reference this to avoid repeating the same mistakes.

## 🚨 Critical Anti-Patterns

### 1. Plain Text Password Storage
**Problem:**
```typescript
// ❌ NEVER do this!
const user = {
  email: 'user@example.com',
  password: 'password123' // Plain text storage
};
await db.users.insert(user);
```

**Solution:**
```typescript
// ✅ Correct way
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 12);
const user = {
  email: 'user@example.com',
  passwordHash: hashedPassword
};
await db.users.insert(user);
```

**Occurred in Project**: 2024-11-15-user-management  
**Impact**: Critical - Security vulnerability  
**Lesson**: Always hash passwords with bcrypt

### 2. Hardcoded API Keys
**Problem:**
```typescript
// ❌ NEVER do this!
const API_KEY = 'sk-1234567890abcdef';
const response = await fetch(url, {
  headers: { 'Authorization': `Bearer ${API_KEY}` }
});
```

**Solution:**
```typescript
// ✅ Correct way
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error('API_KEY environment variable is required');
}
```

**Occurred in Project**: 2024-12-01-payment-integration  
**Impact**: Critical - Security vulnerability  
**Lesson**: Manage all secrets as environment variables

### 3. SQL Injection Vulnerability
**Problem:**
```typescript
// ❌ NEVER do this!
const query = `SELECT * FROM users WHERE email = '${email}'`;
const users = await db.query(query);
```

**Solution:**
```typescript
// ✅ Correct way
const users = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
```

**Occurred in Project**: 2024-10-20-admin-panel  
**Impact**: Critical - Security vulnerability  
**Lesson**: Always use Prepared Statements

## 🔴 High Priority Anti-Patterns

### 4. N+1 Query Problem
**Problem:**
```typescript
// ❌ Performance issue
const users = await User.findAll();
for (const user of users) {
  user.posts = await Post.findAll({ where: { userId: user.id } });
}
// Executes 1 + N queries!
```

**Solution:**
```typescript
// ✅ Correct way
const users = await User.findAll({
  include: [{ model: Post }]
});
// Solved with just 1 query
```

**Occurred in Project**: 2025-01-14-auth-system  
**Impact**: High - Performance degradation  
**Lesson**: Use JOIN for relational data

### 5. Missing Rate Limiting
**Problem:**
```typescript
// ❌ Vulnerable to DDoS attacks
app.post('/auth/login', loginHandler);
```

**Solution:**
```typescript
// ✅ Correct way
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});

app.post('/auth/login', authLimiter, loginHandler);
```

**Occurred in Project**: 2025-01-14-auth-system  
**Impact**: High - Security vulnerability  
**Lesson**: Always apply Rate Limiting to public APIs

### 6. Missing CSRF Protection
**Problem:**
```typescript
// ❌ Vulnerable to CSRF attacks
app.post('/api/transfer', transferHandler);
```

**Solution:**
```typescript
// ✅ Correct way
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });
app.post('/api/transfer', csrfProtection, transferHandler);
```

**Occurred in Project**: 2025-01-14-auth-system  
**Impact**: High - Security vulnerability  
**Lesson**: CSRF protection required for state-changing requests

### 7. Memory Leaks
**Problem:**
```typescript
// ❌ Memory leak occurs
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 1000);
  // No cleanup!
}, []);
```

**Solution:**
```typescript
// ✅ Correct way
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 1000);
  
  return () => clearInterval(interval);
}, []);
```

**Occurred in Project**: 2024-12-10-dashboard  
**Impact**: High - Performance degradation  
**Lesson**: Always write cleanup functions

## 🟡 Medium Priority Anti-Patterns

### 8. God Object/Function
**Problem:**
```typescript
// ❌ One function doing too much
function processOrder(order) {
  // 200 lines of code...
  // Validation, calculation, discount, payment, email, logging, everything
}
```

**Solution:**
```typescript
// ✅ Correct way
function processOrder(order) {
  validateOrder(order);
  const total = calculateTotal(order);
  const discount = applyDiscount(order);
  const payment = processPayment(order, total - discount);
  sendConfirmationEmail(order, payment);
  logOrderProcessed(order);
}
```

**Occurred in Project**: 2024-11-25-ecommerce  
**Impact**: Medium - Difficult maintenance  
**Lesson**: Keep functions under 50 lines

### 9. Deep Nesting
**Problem:**
```typescript
// ❌ 5-level nesting
if (user) {
  if (user.isActive) {
    if (user.hasPermission) {
      if (resource.isAvailable) {
        if (quota.isValid) {
          // Actual logic
        }
      }
    }
  }
}
```

**Solution:**
```typescript
// ✅ Correct way (Early Return)
if (!user) return;
if (!user.isActive) return;
if (!user.hasPermission) return;
if (!resource.isAvailable) return;
if (!quota.isValid) return;

// Actual logic
```

**Occurred in Project**: 2024-12-05-access-control  
**Impact**: Medium - Reduced readability  
**Lesson**: Use Early Return pattern

### 10. Magic Numbers
**Problem:**
```typescript
// ❌ Unclear meaning
if (user.age > 18) {
  // ...
}

setTimeout(() => {}, 86400000);
```

**Solution:**
```typescript
// ✅ Correct way
const LEGAL_AGE = 18;
if (user.age > LEGAL_AGE) {
  // ...
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
setTimeout(() => {}, ONE_DAY_MS);
```

**Occurred in Project**: Multiple projects  
**Impact**: Medium - Reduced readability  
**Lesson**: Declare constants as named variables

### 11. Commented Out Code
**Problem:**
```typescript
// ❌ Leaving commented code
function newFunction() {
  // const oldWay = () => { ... }
  // return oldWay();
  
  return newWay();
}
```

**Solution:**
```typescript
// ✅ Correct way (Delete)
function newFunction() {
  return newWay();
}
// No need for comments, it's in Git history
```

**Occurred in Project**: Multiple projects  
**Impact**: Medium - Code confusion  
**Lesson**: Delete commented code immediately

## 🔵 Low Priority Anti-Patterns

### 12. Unclear Naming
**Problem:**
```typescript
// ❌ Unclear meaning
function proc(d) {
  const t = d.t;
  const r = calc(t);
  return r;
}
```

**Solution:**
```typescript
// ✅ Correct way
function processUserData(userData) {
  const timestamp = userData.timestamp;
  const result = calculateScore(timestamp);
  return result;
}
```

**Occurred in Project**: Multiple projects  
**Impact**: Low - Reduced readability  
**Lesson**: Use clear names

### 13. Unnecessary Comments
**Problem:**
```typescript
// ❌ Explaining the obvious
// Increment i by 1
i++;

// Loop through users
for (const user of users) {
  // ...
}
```

**Solution:**
```typescript
// ✅ Correct way (Remove comments or explain "why")
i++;

// Retry with exponential backoff
await sleep(2 ** retryCount * 1000);
```

**Occurred in Project**: Multiple projects  
**Impact**: Low - Code confusion  
**Lesson**: Comments explain "why", code explains "what"

## 📊 Anti-Pattern Statistics

### Occurrence Frequency (Last 6 months)
1. N+1 queries: 8 times
2. Missing Rate Limiting: 6 times
3. Memory leaks: 5 times
4. Hardcoded API keys: 4 times
5. Missing CSRF protection: 3 times

### Impact Level
- **Critical**: 3 (Plain text passwords, API keys, SQL Injection)
- **High**: 4 (N+1, Rate Limiting, CSRF, Memory leaks)
- **Medium**: 4 (God Object, Deep Nesting, Magic Numbers, Commented code)
- **Low**: 2 (Unclear naming, Unnecessary comments)

## 🎯 Prevention Strategies

### 1. Use Checklists
Include all Anti-Patterns in Reviewer checklists:
- security-reviewer.md
- performance-reviewer.md
- code-quality-reviewer.md

### 2. Automatic Validation
Auto-validate on file save with assess-on-save Hook

### 3. Code Review
Multi-Review on task completion with assess-on-task-complete Hook

### 4. Record Learnings
Record discovered Anti-Patterns in learnings/ folder

## 🔄 Self-Improvement

This document auto-updates:
1. Auto-add new Anti-Patterns when discovered
2. Auto-update occurrence frequency
3. Re-evaluate impact level

---

**Last Updated**: 2025-01-14  
**Total Anti-Patterns**: 13  
**Critical**: 3 | **High**: 4 | **Medium**: 4 | **Low**: 2

**Next Review**: 2025-02-14
