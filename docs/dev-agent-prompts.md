# Developer Agent Prompts - Starter Templates

This document provides ready-to-use prompt templates for various development tasks using AI agents. These prompts are designed to be copy-pasted into AI tools for specific development scenarios.

## 🔧 Code Review Agent

### Prompt Template

```
Act as an expert code reviewer. Analyze the following code and provide:

1. **Security Issues**: Identify potential vulnerabilities or security concerns
2. **Performance Problems**: Highlight inefficient code patterns or bottlenecks
3. **Code Quality**: Review for maintainability, readability, and best practices
4. **Bug Detection**: Identify potential runtime errors or logical issues
5. **Improvement Suggestions**: Recommend specific enhancements

Focus on:
- Laravel/PHP best practices
- React/TypeScript patterns
- Database query optimization
- API security considerations
- Error handling completeness

Code to review:
```
[PASTE CODE HERE]
```

Please provide specific line-by-line feedback where applicable.
```

### Usage Example
Use this prompt when reviewing:
- Pull requests
- New feature implementations
- Critical bug fixes
- Performance-sensitive code

## 🐛 Bug Finder Agent

### Prompt Template

```
Act as a debugging specialist. Analyze the following code/error and help identify the root cause:

**Context:**
- Framework: [Laravel/Next.js/etc.]
- Error Type: [Runtime/Compilation/Logic]
- Expected Behavior: [Describe what should happen]
- Actual Behavior: [Describe what's happening]

**Code/Error Details:**
```
[PASTE CODE OR ERROR MESSAGE HERE]
```

Please provide:
1. **Root Cause Analysis**: What's causing the issue
2. **Step-by-Step Fix**: Specific actions to resolve
3. **Prevention**: How to avoid similar issues
4. **Testing Strategy**: How to verify the fix works

If you need more context, ask specific questions about:
- Environment setup
- Related code files
- Recent changes
- Configuration details
```

### Usage Example
Use this prompt for:
- Runtime errors
- API endpoint failures
- Database connection issues
- Frontend rendering problems

## 📚 Documentation Generator

### Prompt Template

```
Act as a technical documentation specialist. Generate comprehensive documentation for the following code:

**Documentation Type Needed:**
- [ ] API Endpoint Documentation
- [ ] Component Usage Guide
- [ ] Function/Method Documentation
- [ ] Database Schema Documentation
- [ ] Configuration Guide

**Code to Document:**
```
[PASTE CODE HERE]
```

**Additional Context:**
- Purpose: [Brief description of what this code does]
- Audience: [Developers/End Users/Admins]
- Integration Points: [Related systems/components]

Please include:
1. **Overview**: Purpose and functionality
2. **Parameters/Props**: Input requirements and types
3. **Return Values**: Expected outputs
4. **Examples**: Practical usage examples
5. **Error Handling**: Possible errors and responses
6. **Dependencies**: Required packages or setup

Format as Markdown with clear sections and code examples.
```

### Usage Example
Use this prompt for:
- API endpoint documentation
- React component guides
- Database migration docs
- Configuration explanations

## 🛡️ Security Auditor

### Prompt Template

```
Act as a cybersecurity expert conducting a security audit. Analyze the following code for security vulnerabilities:

**Security Focus Areas:**
- [ ] Authentication & Authorization
- [ ] Input Validation & Sanitization
- [ ] SQL Injection Prevention
- [ ] XSS Protection
- [ ] CSRF Protection
- [ ] Data Encryption
- [ ] API Security
- [ ] File Upload Security

**Code to Audit:**
```
[PASTE CODE HERE]
```

**System Context:**
- Framework: [Laravel/Next.js/etc.]
- Environment: [Development/Production]
- User Roles: [Guest/User/Admin]
- Sensitive Data: [Describe any sensitive data handled]

Please provide:
1. **Vulnerability Assessment**: Identified security issues (rate severity: Critical/High/Medium/Low)
2. **Exploit Scenarios**: How each vulnerability could be exploited
3. **Remediation Steps**: Specific code changes needed
4. **Best Practices**: Additional security measures to implement
5. **Testing Recommendations**: How to verify security fixes

Include OWASP references where applicable.
```

### Usage Example
Use this prompt for:
- Authentication system reviews
- API endpoint security checks
- User input validation
- File upload functionality

## ⚡ Performance Optimizer

### Prompt Template

```
Act as a performance optimization expert. Analyze the following code for performance improvements:

**Performance Focus:**
- [ ] Database Query Optimization
- [ ] Frontend Rendering Performance
- [ ] API Response Times
- [ ] Memory Usage
- [ ] Caching Strategies
- [ ] Bundle Size Optimization

**Code to Optimize:**
```
[PASTE CODE HERE]
```

**Current Performance Issues:**
- Load Time: [Current metrics if available]
- Memory Usage: [Current usage]
- Query Count: [Database queries]
- User Experience: [Specific problems users report]

**System Context:**
- Expected Load: [Number of users/requests]
- Critical Paths: [Most important user flows]
- Constraints: [Technical limitations]

Please provide:
1. **Performance Analysis**: Identified bottlenecks and inefficiencies
2. **Optimization Strategies**: Specific improvements with expected impact
3. **Implementation Priority**: Order improvements by impact/effort ratio
4. **Measurement Plan**: How to track performance improvements
5. **Trade-offs**: Any compromises in maintainability or features

Include before/after code examples where helpful.
```

### Usage Example
Use this prompt for:
- Slow API endpoints
- Large React component trees
- Complex database queries
- Frontend bundle optimization

## 🔄 Refactoring Assistant

### Prompt Template

```
Act as a code refactoring expert. Help improve the following code structure while maintaining functionality:

**Refactoring Goals:**
- [ ] Improve Readability
- [ ] Reduce Code Duplication
- [ ] Enhance Maintainability
- [ ] Better Error Handling
- [ ] Improved Testability
- [ ] Design Pattern Implementation

**Code to Refactor:**
```
[PASTE CODE HERE]
```

**Current Issues:**
- [Describe specific problems with current code]
- [Areas that are hard to maintain or understand]
- [Repeated patterns that could be abstracted]

**Constraints:**
- Must maintain backward compatibility: [Yes/No]
- Testing requirements: [Existing tests to maintain]
- Performance requirements: [Cannot be slower than current]

Please provide:
1. **Refactored Code**: Improved version with explanations
2. **Design Patterns**: Suggested patterns and why they fit
3. **Breaking Changes**: Any changes that affect existing code
4. **Migration Plan**: Step-by-step refactoring approach
5. **Testing Strategy**: How to ensure functionality is preserved

Explain the benefits of each change.
```

### Usage Example
Use this prompt for:
- Legacy code modernization
- Complex function simplification
- Duplicate code elimination
- Architecture improvements

## 🚨 Safety Notes and Best Practices

### ⚠️ Important Safety Guidelines

1. **Never Share Sensitive Data**
   - Remove API keys, passwords, database credentials
   - Anonymize user data and personal information
   - Replace production URLs with examples

2. **Validate AI Suggestions**
   - Always review generated code before implementing
   - Test suggested changes in development environment
   - Verify security recommendations with security experts

3. **Context Limitations**
   - AI agents may not understand full system architecture
   - Provide sufficient context for accurate recommendations
   - Consider system-wide impacts of suggested changes

4. **Version Control**
   - Commit working code before applying AI suggestions
   - Use feature branches for experimental changes
   - Document AI-assisted changes in commit messages

### 🔒 Security Considerations

- **Code Privacy**: Be cautious about sharing proprietary algorithms
- **Compliance**: Ensure AI-generated code meets regulatory requirements
- **Licensing**: Verify any suggested libraries have compatible licenses
- **Dependencies**: Review security of any new dependencies suggested

### ✅ Best Practices for AI-Assisted Development

1. **Iterative Approach**: Start with small changes and build up
2. **Human Oversight**: Always have experienced developers review AI suggestions
3. **Testing**: Implement comprehensive tests for AI-generated code
4. **Documentation**: Document the reasoning behind AI-suggested changes
5. **Team Alignment**: Ensure AI-assisted changes align with team coding standards

### 📝 Prompt Engineering Tips

1. **Be Specific**: Provide clear context and requirements
2. **Include Examples**: Show desired input/output formats
3. **Set Constraints**: Mention any limitations or requirements
4. **Ask for Explanations**: Request reasoning behind suggestions
5. **Iterate**: Refine prompts based on initial results

---

## 🔗 Related Resources

- [AI Tools Platform Documentation](../README.md)
- [Security Guidelines](../docs/security.md)
- [Performance Best Practices](../docs/performance.md)
- [Code Review Checklist](../docs/code-review.md)

Remember: AI agents are powerful tools to assist development, but human expertise and judgment remain essential for building secure, maintainable, and effective software systems.