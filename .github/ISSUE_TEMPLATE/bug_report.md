---
name: 🐛 Bug Report
about: Create a bug report to help us improve
title: '[BUG] '
labels: 'bug'
assignees: ''
---

## 📋 Describe the Bug

A clear and concise description of what the bug is.

## 🔍 Steps to Reproduce

Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## 😕 Expected Behavior

A clear and concise description of what you expected to happen.

## 📸 Screenshots/Video

If applicable, add screenshots or video to help explain your problem.

## 💻 Environment

- **OS**: [e.g., macOS 14.2, Windows 11, Ubuntu 22.04]
- **Browser**: [e.g., Chrome 120, Firefox 121, Safari 17]
- **React Version**: [e.g., 18.2.0, 19.0.0]
- **react-smart-crop Version**: [e.g., 1.0.2]
- **Build Tool**: [e.g., Vite 5.0, Webpack 5.89]

## 🔗 Minimal Reproducible Example

```jsx
import { SmartCropImage } from '@sargis-artashyan/react-smart-crop';

export function BugExample() {
  return (
    <SmartCropImage
      src="path/to/image.jpg"
      width={300}
      height={300}
      alt="Example"
    />
  );
}
```

## 📝 Additional Context

Add any other context about the problem here.

- Does this occur in production build?
- Does this occur with WebAssembly support disabled?
- Does this occur on mobile devices?
- Any console errors or warnings?

## ✅ Checklist

- [ ] I've checked the [README](../README.md) and [Troubleshooting](../README.md#-troubleshooting--caveats) section
- [ ] I've searched [existing issues](https://github.com/sargisartashyanmain/react-smart-crop/issues)
- [ ] This is not a question (use [Discussions](https://github.com/sargisartashyanmain/react-smart-crop/discussions) instead)
- [ ] I've provided a minimal reproducible example
