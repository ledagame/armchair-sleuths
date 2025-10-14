# Learning System

This folder stores learning files automatically generated when projects complete.

## 📁 File Structure

```
learnings/
├── README.md (this file)
├── learning-template.md (template)
└── YYYY-MM-DD-project-name.md (actual learning files)
```

## 🎯 Purpose

Systematically record learnings from each project to:
1. Automatically reference in next projects
2. Prevent repeating same mistakes
3. Reuse success patterns
4. Share team knowledge

## 📝 Creating Learning Files

### Automatic Generation
`codify-on-project-complete.kiro.hook` automatically generates on project completion:
```
"Project is complete. Please record the learnings."
```

### Manual Creation
Copy `learning-template.md` to create manually

## 📊 Learning File Format

```markdown
---
name: project-name-learning
project: Project Full Name
domain: authentication | payment | analytics | etc
date: YYYY-MM-DD
tech-stack: [TypeScript, React, PostgreSQL]
team-size: 3
duration: 4 weeks
---

# Project Name Learnings

## Success Patterns
[Auto-extracted]

## Issues Encountered
[Auto-extracted]

## Apply to Next Project
[Auto-extracted]

## Metrics
[Auto-collected]
```

## 🔄 Compounding Effect

### Project 1
- Learning files: 0
- Available references: None
- Issues: 15

### Project 2
- Learning files: 1
- Available references: Project 1 learnings
- Issues: 8 (7 prevented)

### Project 3
- Learning files: 2
- Available references: Projects 1, 2 learnings
- Issues: 3 (12 prevented)

## 💡 Usage

### 1. On Project Completion
```
"Project is complete. Please record the learnings."
```

### 2. Auto-Reference When Creating Specs
```
"Create a user authentication system spec"
→ enhance-spec.kiro.hook automatically searches learnings/ folder
→ Auto-applies similar project learnings
```

### 3. Manual Reference
Directly reference specific learning files:
```
"Create new spec referencing learnings from 2025-01-14-auth-system.md"
```

## 🔗 Related Documents

- `.kiro/hooks/codify-on-project-complete.kiro.hook` - Auto-extract learnings
- `.kiro/hooks/enhance-spec.kiro.hook` - Auto-apply learnings
- `.kiro/steering/patterns/successful-patterns.md` - Success pattern collection

## 📈 Metrics Tracking

Each learning file includes these metrics:
- Setup Time
- Issues Found
- Time to Fix
- Total Time
- Improvement rate vs previous

This allows measuring and visualizing the compounding effect.

---

**Next Steps:**
1. Complete first project
2. Run `codify-on-project-complete.kiro.hook`
3. Learning file auto-generated
4. Auto-utilized in next project!
