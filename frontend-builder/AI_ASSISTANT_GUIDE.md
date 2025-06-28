# AI Assistant User Guide

## Overview

The AI Assistant is a powerful tool that helps you design, build, and modify workflows in LessCode using natural language. You can now interact with AI to create nodes, modify code, and optimize your workflows without leaving the visual editor.

## Getting Started

### Opening the AI Assistant

1. Navigate to any workflow in your application
2. Click the "AI Assistant" button in the top-right corner of the workflow editor
3. The AI chat sidebar will slide in from the right side of the screen

### Basic Usage

The AI Assistant understands natural language commands and can help you with:

- **Creating new nodes**: "Add a function node that validates user input"
- **Modifying existing nodes**: "Update the email node to include CC recipients"
- **Connecting nodes**: "Connect the validation node to the email node"
- **Workflow optimization**: "Optimize this workflow for better performance"
- **Code assistance**: "Help me write a function that processes JSON data"

## Available Commands

### Node Management

- **Add nodes**: "Create a new function node called 'Data Processor'"
- **Remove nodes**: "Delete the validation node"
- **Modify nodes**: "Rename the email node to 'Notification Sender'"
- **Duplicate nodes**: "Make a copy of the data processor node"

### Workflow Structure

- **Add connections**: "Connect the input node to the processor node"
- **Remove connections**: "Disconnect the validation node from the email node"
- **Reorganize layout**: "Rearrange the nodes in a grid layout"

### Code Assistance

- **Code generation**: "Write a function that filters users by age"
- **Code modification**: "Update the function to handle null values"
- **Error fixing**: "Fix the syntax error in the validation function"
- **Best practices**: "Optimize this code for better performance"

### Workflow Analysis

- **Validation**: "Check if this workflow has any issues"
- **Optimization**: "Suggest improvements for this workflow"
- **Documentation**: "Explain what this workflow does"

## Examples

### Example 1: Creating a User Registration Workflow

```
User: "Create a workflow for user registration with validation and email confirmation"

AI: I'll help you create a user registration workflow. Let me add the necessary nodes:

1. Input node for user data
2. Validation node to check email format and password strength
3. Database node to save user information
4. Email node to send confirmation
5. Response node to return success/error

[AI creates the nodes and connects them automatically]
```

### Example 2: Modifying Existing Code

```
User: "Update the validation function to also check for minimum password length of 8 characters"

AI: I'll modify the validation function to include password length checking:

```javascript
// Updated validation function
function validateUser(user) {
  const errors = [];
  
  if (!user.email || !user.email.includes('@')) {
    errors.push('Invalid email format');
  }
  
  if (!user.password || user.password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}
```

### Example 3: Workflow Optimization

```
User: "This workflow seems slow, can you optimize it?"

AI: I'll analyze your workflow and suggest optimizations:

1. **Performance Issues Found:**
   - Multiple database calls in sequence
   - Unnecessary data transformations
   - Missing error handling

2. **Optimizations Applied:**
   - Combined database operations
   - Added caching for repeated lookups
   - Improved error handling with try-catch blocks
   - Reorganized nodes for better flow

[AI applies the optimizations automatically]
```

## Tips for Better Results

### Be Specific
- ❌ "Fix this"
- ✅ "Fix the validation error in the email node"

### Provide Context
- ❌ "Add a node"
- ✅ "Add a function node that processes user data and validates email format"

### Use Clear Language
- ❌ "Make it work"
- ✅ "Connect the input node to the validation node, then to the database node"

### Ask for Explanations
- "Why did you structure the workflow this way?"
- "Can you explain what this function does?"
- "What are the potential issues with this approach?"

## Keyboard Shortcuts

- **Enter**: Send message
- **Shift + Enter**: New line in message
- **Escape**: Close chat sidebar
- **Ctrl/Cmd + Z**: Undo last AI change
- **Ctrl/Cmd + Y**: Redo last AI change

## Troubleshooting

### Common Issues

**AI doesn't understand my request**
- Try rephrasing your request more clearly
- Provide more context about what you're trying to achieve
- Use specific technical terms when possible

**AI made incorrect changes**
- Use the undo button (Ctrl/Cmd + Z) to revert changes
- Ask the AI to explain what it did and why
- Provide more specific feedback about what went wrong

**Chat is not responding**
- Check your internet connection
- Refresh the page and try again
- Make sure you're in a workflow editor

### Getting Help

If you encounter issues with the AI Assistant:

1. Check this guide for common solutions
2. Try rephrasing your request
3. Contact support with specific details about the issue

## Advanced Features

### Context Awareness
The AI Assistant understands:
- Your current workflow structure
- Available databases and endpoints
- Selected nodes and their properties
- Application configuration

### Tool Integration
The AI can automatically:
- Execute workflow modifications
- Apply code changes
- Validate workflow structure
- Optimize performance

### Conversation Memory
The AI remembers your conversation context, so you can:
- Reference previous changes
- Build on previous requests
- Ask follow-up questions
- Get contextual suggestions

## Best Practices

1. **Start Simple**: Begin with basic requests and build complexity
2. **Review Changes**: Always review AI-generated changes before saving
3. **Test Thoroughly**: Test workflows after AI modifications
4. **Provide Feedback**: Let the AI know if something doesn't work as expected
5. **Use Iteratively**: Make small changes and iterate rather than large complex requests

## Privacy and Security

- All conversations are processed securely
- No sensitive data is stored permanently
- AI responses are generated in real-time
- Your workflow data remains private and secure

---

For more information or support, please contact the LessCode team. 