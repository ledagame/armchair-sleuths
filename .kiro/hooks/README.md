# Kiro Hooks for Compounding Engineering

This folder contains Kiro Hooks that automate the Assess and Codify phases of Compounding Engineering.

## 📋 Hook List

### Assess Layer (Quality Validation)
1. **assess-on-save.kiro.hook** - Automatic review on file save
2. **assess-on-task-complete.kiro.hook** - Multi-review on task completion

### Codify Layer (Learning Capture)
3. **codify-on-project-complete.kiro.hook** - Learning extraction on project completion
4. **enhance-spec.kiro.hook** - Inject past learnings when creating specs

## 🎯 How to Use Hooks

### 1. Enable Hooks
Enable hooks in Kiro IDE's Agent Hooks section:
- Explorer View → Agent Hooks
- Or Command Palette → "Open Kiro Hook UI"

### 2. Hook Triggers
Each hook automatically executes on specific events:
- **File save** → assess-on-save
- **Task complete** → assess-on-task-complete
- **Project complete** → codify-on-project-complete
- **Spec creation** → enhance-spec

### 3. Customize Hooks
Edit each hook file to adjust for your project needs.

## 💡 Hook Structure

### Hook File Format
```json
{
  "enabled": true,
  "name": "Hook Name",
  "description": "Hook description",
  "version": "1",
  "when": {
    "type": "fileEdited|manual",
    "patterns": ["src/**/*.ts"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Detailed instructions..."
  }
}
```

### Supported Trigger Types
- `fileEdited` - When files are saved
- `manual` - Manual execution by user

## 🔄 Compounding Effect

Using hooks provides:
1. **Automatic validation** - Catch issues immediately
2. **Automatic learning** - Knowledge accumulates automatically
3. **Automatic application** - Learnings applied to next project

### Project 1
- Manual Review: 2 hours
- Issues Found: 15
- Learning: Manual recording

### Project 2 (Using Hooks)
- Auto Review: 5 minutes
- Issues Found: 8 (7 prevented)
- Learning: Automatic recording

### Project 3 (More Learnings)
- Auto Review: 2 minutes
- Issues Found: 3
- Learning: Auto record + auto apply

## 📚 Reference Materials

- `.kiro/steering/compounding/` - Compounding Engineering philosophy
- `.kiro/steering/reviewers/` - Reviewer checklists
- `.kiro/steering/patterns/` - Success patterns
- `.kiro/steering/learnings/` - Project learnings

---

**Next Steps:**
1. Review each hook file
2. Customize for your project
3. Enable hooks
4. Test on first project
