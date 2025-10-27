# Deployment Guide - Suspect Prompt Enhancement

**Version**: 1.0.0  
**Last Updated**: 2025-01-24  
**Purpose**: Phase-by-phase deployment guide for suspect prompt enhancement features

---

## Overview

This guide provides a structured approach to deploying the suspect prompt enhancement features in four phases:

1. **Phase 1**: Few-Shot Examples
2. **Phase 2**: Quality Validation
3. **Phase 3**: Multilingual Support
4. **Phase 4**: Workflow Automation

Each phase builds on the previous one and can be deployed independently.

---

## Pre-Deployment Checklist

Before starting any deployment phase:

### Environment Setup
- [ ] Development environment configured
- [ ] Staging environment available
- [ ] Production environment ready
- [ ] Environment variables documented

### Code Quality
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] ESLint checks passing
- [ ] No console errors in development

### Documentation
- [ ] README.md updated
- [ ] CHANGELOG.md updated
- [ ] API documentation current
- [ ] User guides available

### Backup
- [ ] Database backup created
- [ ] Configuration files backed up
- [ ] Rollback plan documented
- [ ] Recovery procedures tested

---

## Phase 1: Few-Shot Examples

**Goal**: Deploy 40 Few-Shot examples (5 archetypes × 8 examples) integrated into PROMPT.md

**Timeline**: 1-2 weeks  
**Risk Level**: Low  
**Dependencies**: None

### 1.1 Pre-Deployment Tasks

#### Verify Example Completion
```bash
# Check that all 40 examples are written
npm run suspect:workflow:batch-validate
```

**Expected Output**:
```
✅ Total Examples: 40
✅ Completed Examples: 40
✅ Quality Pass Rate: ≥ 90%
```

#### Validate Example Quality
```bash
# Validate each archetype
npm run suspect:validate -- --archetype "Wealthy Heir"
npm run suspect:validate -- --archetype "Loyal Butler"
npm run suspect:validate -- --archetype "Talented Artist"
npm run suspect:validate -- --archetype "Business Partner"
npm run suspect:validate -- --archetype "Former Police Officer"
```

**Quality Criteria**:
- [ ] All examples pass quality validation (Overall ≥ 65)
- [ ] Character Consistency ≥ 60 for all examples
- [ ] Emotional Alignment ≥ 60 for all examples
- [ ] Information Content ≥ 50 for all examples
- [ ] Natural Dialogue ≥ 60 for all examples

#### Integration Check
```bash
# Verify PROMPT.md integration
grep -A 5 "FEW-SHOT EXAMPLES" skills/suspect-personality-core/PROMPT.md
```

**Expected**:
- [ ] `{{FEW_SHOT_EXAMPLES}}` variable present in PROMPT.md
- [ ] Examples properly formatted
- [ ] Analysis sections complete

### 1.2 Staging Deployment

#### Deploy to Staging
```bash
# Copy files to staging environment
cp -r skills/suspect-ai-prompter/* staging/skills/suspect-ai-prompter/
cp -r src/server/services/prompts/archetypes/* staging/src/server/services/prompts/archetypes/
```

#### Test in Staging
```bash
# Generate test responses
npm run test:suspect-responses -- --env staging

# Validate responses
npm run suspect:validate -- --env staging
```

**Test Cases**:
- [ ] Generate responses for all 5 archetypes
- [ ] Test all 4 emotional states
- [ ] Test both guilty and innocent variations
- [ ] Verify word count ranges
- [ ] Check character consistency

#### Performance Testing
```bash
# Measure response generation time
npm run test:performance -- --feature few-shot
```

**Performance Targets**:
- [ ] Response generation < 2 seconds
- [ ] No memory leaks
- [ ] No performance degradation over time

### 1.3 Production Deployment

#### Deploy to Production
```bash
# Create deployment tag
git tag -a v2.2.0-phase1 -m "Phase 1: Few-Shot Examples"
git push origin v2.2.0-phase1

# Deploy to production
npm run deploy:production
```

#### Post-Deployment Verification
```bash
# Verify deployment
npm run verify:production -- --phase 1

# Monitor logs
npm run logs:production -- --follow
```

**Verification Checklist**:
- [ ] All 40 examples accessible
- [ ] PROMPT.md correctly integrated
- [ ] Response generation working
- [ ] No errors in logs
- [ ] Performance within targets

#### Monitoring
```bash
# Monitor quality metrics
npm run monitor:quality -- --phase 1
```

**Monitor for 48 hours**:
- [ ] Response quality scores
- [ ] Character consistency rates
- [ ] User feedback
- [ ] Error rates

### 1.4 Rollback Plan

If issues occur:

```bash
# Rollback to previous version
git revert v2.2.0-phase1
npm run deploy:production

# Restore backup
npm run restore:backup -- --date [backup-date]
```

**Rollback Triggers**:
- Quality scores drop below 65
- Error rate exceeds 5%
- Performance degradation > 20%
- Critical user feedback

---

## Phase 2: Quality Validation

**Goal**: Integrate real-time quality validation into SuspectAIService

**Timeline**: 1 week  
**Risk Level**: Medium  
**Dependencies**: Phase 1 complete

### 2.1 Pre-Deployment Tasks

#### Verify Quality Validator
```bash
# Test quality validator
npm run test:quality-validator

# Benchmark performance
npm run benchmark:quality-validation
```

**Performance Targets**:
- [ ] Validation overhead < 50ms
- [ ] No blocking operations
- [ ] Async validation working

#### Integration Testing
```bash
# Test SuspectAIService integration
npm run test:integration -- --feature quality-validation
```

**Test Cases**:
- [ ] Quality validation runs automatically
- [ ] Development mode shows detailed feedback
- [ ] Production mode logs silently
- [ ] Environment variable control works
- [ ] Quality scores returned correctly

### 2.2 Staging Deployment

#### Enable in Development Environment
```bash
# Set environment variable
export ENABLE_QUALITY_VALIDATION=true

# Restart services
npm run restart:dev
```

#### Test Quality Validation
```bash
# Generate responses with validation
npm run test:suspect-responses -- --validate

# Check quality logs
npm run logs:quality -- --tail 100
```

**Validation Checks**:
- [ ] Quality scores calculated correctly
- [ ] Feedback messages clear and actionable
- [ ] Logging working properly
- [ ] No performance impact

#### Monitor Performance
```bash
# Monitor validation overhead
npm run monitor:performance -- --feature quality-validation
```

**Performance Targets**:
- [ ] Average overhead < 50ms
- [ ] 95th percentile < 100ms
- [ ] No memory leaks

### 2.3 Production Deployment

#### Deploy with Feature Flag
```bash
# Deploy with feature flag disabled
export ENABLE_QUALITY_VALIDATION=false
npm run deploy:production

# Gradually enable for users
npm run feature-flag:enable -- --feature quality-validation --percentage 10
```

#### Gradual Rollout
```
Day 1: 10% of users
Day 2: 25% of users
Day 3: 50% of users
Day 4: 75% of users
Day 5: 100% of users
```

#### Monitor Quality Metrics
```bash
# Monitor quality dashboard
npm run monitor:quality-dashboard
```

**Monitor**:
- [ ] Quality pass rate ≥ 90%
- [ ] Average quality score ≥ 75
- [ ] Performance overhead < 50ms
- [ ] Error rate < 1%

### 2.4 Rollback Plan

If issues occur:

```bash
# Disable feature flag
npm run feature-flag:disable -- --feature quality-validation

# Rollback if necessary
git revert v2.2.0-phase2
npm run deploy:production
```

**Rollback Triggers**:
- Performance overhead > 100ms
- Error rate > 5%
- Quality scores inconsistent
- User complaints

---

## Phase 3: Multilingual Support

**Goal**: Deploy Korean language support with language-specific quality criteria

**Timeline**: 1-2 weeks  
**Risk Level**: Medium  
**Dependencies**: Phase 1 and 2 complete

### 3.1 Pre-Deployment Tasks

#### Verify Korean Translation
```bash
# Validate Korean PROMPT.md
npm run validate:translation -- --lang ko

# Test Korean examples
npm run suspect:validate -- --lang ko
```

**Translation Checklist**:
- [ ] PROMPT.ko.md complete
- [ ] 40 Korean examples written
- [ ] Word count ranges adjusted (75% of English)
- [ ] Quality criteria defined
- [ ] Cultural adaptation appropriate

#### Test Korean Responses
```bash
# Generate Korean responses
npm run test:suspect-responses -- --lang ko

# Validate quality
npm run suspect:workflow:batch-validate -- --lang ko
```

**Quality Targets**:
- [ ] Korean quality pass rate ≥ 90%
- [ ] Average quality score ≥ 75
- [ ] Natural Korean expressions
- [ ] Appropriate formality levels

### 3.2 Staging Deployment

#### Deploy Korean Support
```bash
# Deploy Korean files
cp skills/suspect-ai-prompter/PROMPT.ko.md staging/
cp src/server/services/prompts/archetypes/*.ko.yaml staging/

# Restart services
npm run restart:staging
```

#### Test Language Switching
```bash
# Test language parameter
npm run test:language-switching -- --from en --to ko
```

**Test Cases**:
- [ ] Language parameter works
- [ ] Korean PROMPT.md loads correctly
- [ ] Korean examples used
- [ ] Word count ranges correct
- [ ] Quality validation works

### 3.3 Production Deployment

#### Deploy Korean Support
```bash
# Create deployment tag
git tag -a v2.2.0-phase3 -m "Phase 3: Multilingual Support"
git push origin v2.2.0-phase3

# Deploy to production
npm run deploy:production
```

#### Monitor Language Usage
```bash
# Monitor language distribution
npm run monitor:language-usage
```

**Monitor**:
- [ ] Korean response quality
- [ ] Language switching errors
- [ ] User feedback
- [ ] Performance impact

### 3.4 Rollback Plan

If issues occur:

```bash
# Disable Korean support
npm run feature-flag:disable -- --feature korean-support

# Rollback if necessary
git revert v2.2.0-phase3
npm run deploy:production
```

**Rollback Triggers**:
- Korean quality scores < 65
- Language switching errors > 5%
- User complaints about Korean quality
- Performance issues

---

## Phase 4: Workflow Automation

**Goal**: Deploy automated workflows for archetype creation and validation

**Timeline**: 1 week  
**Risk Level**: Low  
**Dependencies**: Phase 1, 2, and 3 complete

### 4.1 Pre-Deployment Tasks

#### Test Workflow Scripts
```bash
# Test new archetype workflow
npm run suspect:workflow:new-archetype -- --test

# Test batch validation workflow
npm run suspect:workflow:batch-validate -- --test

# Test prompt improvement workflow
npm run suspect:workflow:improve-prompt -- --test
```

**Workflow Checks**:
- [ ] New archetype workflow completes successfully
- [ ] Batch validation produces correct statistics
- [ ] Prompt improvement generates actionable suggestions
- [ ] All workflows handle errors gracefully

#### CI/CD Integration
```bash
# Test CI/CD integration
npm run test:ci-cd -- --feature workflow-automation
```

**CI/CD Checks**:
- [ ] Quality checks run on PR
- [ ] Build fails if quality drops below threshold
- [ ] Automated tests pass
- [ ] Deployment pipeline works

### 4.2 Staging Deployment

#### Deploy Workflow Scripts
```bash
# Deploy workflow scripts
cp -r skills/suspect-ai-prompter/scripts/* staging/skills/suspect-ai-prompter/scripts/

# Update npm scripts
npm run update:package-json -- --env staging
```

#### Test Workflows
```bash
# Test each workflow
npm run test:workflows -- --env staging
```

**Test Cases**:
- [ ] Create new archetype end-to-end
- [ ] Batch validate all examples
- [ ] Improve prompt and apply suggestions
- [ ] CI/CD integration works

### 4.3 Production Deployment

#### Deploy Workflows
```bash
# Create deployment tag
git tag -a v2.2.0-phase4 -m "Phase 4: Workflow Automation"
git push origin v2.2.0-phase4

# Deploy to production
npm run deploy:production
```

#### Enable CI/CD Integration
```bash
# Enable quality checks in CI/CD
npm run ci-cd:enable -- --feature quality-checks
```

**CI/CD Configuration**:
- [ ] Quality checks run on every PR
- [ ] Build fails if quality < 65
- [ ] Automated tests run
- [ ] Deployment requires approval

### 4.4 Post-Deployment Verification

#### Verify Workflows
```bash
# Verify all workflows
npm run verify:workflows -- --env production
```

**Verification Checklist**:
- [ ] New archetype workflow works
- [ ] Batch validation works
- [ ] Prompt improvement works
- [ ] CI/CD integration active
- [ ] No errors in logs

---

## Post-Deployment Monitoring

### Quality Metrics Dashboard

Monitor these metrics continuously:

```bash
# View quality dashboard
npm run monitor:quality-dashboard
```

**Key Metrics**:
- **Quality Pass Rate**: ≥ 90%
- **Average Quality Score**: ≥ 75
- **Character Consistency**: ≥ 80
- **Emotional Alignment**: ≥ 80
- **Performance Overhead**: < 50ms

### Alert Thresholds

Set up alerts for:

| Metric | Warning | Critical |
|--------|---------|----------|
| Quality Pass Rate | < 85% | < 80% |
| Average Score | < 70 | < 65 |
| Performance Overhead | > 75ms | > 100ms |
| Error Rate | > 2% | > 5% |

### Weekly Review

Every week, review:

- [ ] Quality trends
- [ ] User feedback
- [ ] Performance metrics
- [ ] Error logs
- [ ] Feature usage

---

## Troubleshooting

### Common Issues

#### Issue: Quality Scores Drop After Deployment

**Symptoms**: Quality pass rate < 90%

**Diagnosis**:
```bash
npm run diagnose:quality-drop
```

**Solutions**:
1. Review recent changes to PROMPT.md
2. Check if examples are being used correctly
3. Validate archetype data integrity
4. Review quality criteria thresholds

#### Issue: Performance Degradation

**Symptoms**: Response time > 2 seconds

**Diagnosis**:
```bash
npm run diagnose:performance
```

**Solutions**:
1. Check if caching is working
2. Review async validation implementation
3. Optimize quality validation logic
4. Scale infrastructure if needed

#### Issue: Language Switching Errors

**Symptoms**: Korean responses fail or use English

**Diagnosis**:
```bash
npm run diagnose:language-switching
```

**Solutions**:
1. Verify PROMPT.ko.md exists
2. Check language parameter passing
3. Validate Korean examples
4. Review language configuration

---

## Success Criteria

### Phase 1 Success
- [ ] All 40 examples deployed
- [ ] Quality pass rate ≥ 90%
- [ ] No performance degradation
- [ ] Positive user feedback

### Phase 2 Success
- [ ] Quality validation integrated
- [ ] Performance overhead < 50ms
- [ ] Quality metrics tracked
- [ ] Development feedback working

### Phase 3 Success
- [ ] Korean support working
- [ ] Korean quality ≥ 90%
- [ ] Language switching seamless
- [ ] Cultural adaptation appropriate

### Phase 4 Success
- [ ] All workflows operational
- [ ] CI/CD integration active
- [ ] Automated validation working
- [ ] Developer productivity improved

---

## Rollback Procedures

### Emergency Rollback

If critical issues occur:

```bash
# Immediate rollback
npm run rollback:emergency

# Restore from backup
npm run restore:backup -- --latest

# Notify team
npm run notify:rollback -- --reason "[reason]"
```

### Partial Rollback

If only one phase has issues:

```bash
# Rollback specific phase
npm run rollback:phase -- --phase [1|2|3|4]

# Verify rollback
npm run verify:rollback
```

---

## Communication Plan

### Stakeholder Updates

**Before Deployment**:
- Notify team of deployment schedule
- Share deployment plan
- Confirm backup procedures

**During Deployment**:
- Update status in real-time
- Report any issues immediately
- Confirm each phase completion

**After Deployment**:
- Share deployment summary
- Report metrics and results
- Gather feedback

### User Communication

**Announcement Template**:
```
🎉 New Feature: [Feature Name]

We've deployed [feature description].

What's New:
- [Feature 1]
- [Feature 2]
- [Feature 3]

Benefits:
- [Benefit 1]
- [Benefit 2]

Learn More: [link to documentation]
```

---

## Maintenance Plan

### Daily Tasks
- [ ] Monitor quality metrics
- [ ] Review error logs
- [ ] Check performance metrics

### Weekly Tasks
- [ ] Review quality trends
- [ ] Analyze user feedback
- [ ] Update documentation
- [ ] Plan improvements

### Monthly Tasks
- [ ] Comprehensive quality review
- [ ] Performance optimization
- [ ] Feature usage analysis
- [ ] Roadmap planning

---

## Appendix

### Environment Variables

```bash
# Quality Validation
ENABLE_QUALITY_VALIDATION=true|false

# Language Support
DEFAULT_LANGUAGE=en|ko
SUPPORTED_LANGUAGES=en,ko

# Performance
QUALITY_VALIDATION_TIMEOUT=50
CACHE_TTL=3600

# Monitoring
QUALITY_METRICS_ENABLED=true
LOG_LEVEL=info|debug|error
```

### Deployment Commands Reference

```bash
# Deployment
npm run deploy:staging
npm run deploy:production

# Verification
npm run verify:deployment
npm run verify:quality

# Monitoring
npm run monitor:quality-dashboard
npm run monitor:performance

# Rollback
npm run rollback:emergency
npm run rollback:phase -- --phase [number]

# Testing
npm run test:integration
npm run test:performance
npm run test:workflows
```

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-01-24  
**Status**: Active

**Made with ❤️ for reliable, high-quality deployments**
