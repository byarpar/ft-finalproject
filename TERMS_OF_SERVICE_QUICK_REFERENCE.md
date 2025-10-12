# Terms of Service - Quick Reference

## 📄 Page Overview

**URL**: `/terms` or `/terms-of-service`  
**Component**: `TermsOfService.js`  
**Lines**: 850+  
**Purpose**: Legal agreement between users and Lisu Dictionary

---

## 🎨 Visual Layout

```
┌─────────────────────────────────────────────────┐
│              HERO SECTION                       │
│         ⚖️  Terms of Service                    │
│   "Please read these terms carefully..."        │
└─────────────────────────────────────────────────┘

Desktop Layout (lg+):
┌──────────────┬──────────────────────────────────┐
│   SIDEBAR    │      MAIN CONTENT                │
│   (25-30%)   │      (70-75%)                    │
│              │                                  │
│ Table of     │  Website Terms of Service        │
│ Contents:    │  Last Updated: Oct 26, 2024      │
│              │                                  │
│ 1. Accept... │  Introduction paragraph...       │
│ 2. User A... │                                  │
│ 3. User C... │  1. Acceptance of Terms          │
│ 4. Content...│  Content here...                 │
│ 5. Intell... │                                  │
│ 6. Discla... │  2. User Accounts                │
│ 7. Limita... │  2.1 Account Registration        │
│ 8. Indemn... │  Content here...                 │
│ 9. Govern... │                                  │
│ 10. Termi... │  ... (all 12 sections)           │
│ 11. Change...│                                  │
│ 12. Contac...│  Acknowledgment footer           │
│              │  [View Privacy] [Help] [Contact] │
│ (Sticky)     │                                  │
└──────────────┴──────────────────────────────────┘

Mobile Layout:
┌─────────────────────────────────────────────────┐
│  Table of Contents (Grid)                       │
│  [1. Accept...] [2. User Acc...]                │
│  [3. User Con..] [4. Content...]                │
│  ... (all 12 in 2-column grid)                  │
├─────────────────────────────────────────────────┤
│  Website Terms of Service                       │
│  All sections stack vertically                  │
│  1. Acceptance of Terms                         │
│  2. User Accounts                               │
│  ... (full content)                             │
└─────────────────────────────────────────────────┘

                                    [↑ Back to Top]
                                    (Fixed button)
```

---

## 📑 12 Sections Summary

| # | Section | Key Points |
|---|---------|------------|
| 1 | **Acceptance of Terms** | Binding agreement, 13+ age, parental consent |
| 2 | **User Accounts** | Registration, security, termination |
| 3 | **User Conduct** | Prohibited activities, community rules |
| 4 | **Content Ownership** | User rights, platform license, moderation |
| 5 | **Intellectual Property** | Platform ownership, trademark, database |
| 6 | **Disclaimer** | "AS IS", no warranties, accuracy not guaranteed |
| 7 | **Limitation of Liability** | Max $100, no consequential damages |
| 8 | **Indemnification** | User holds platform harmless |
| 9 | **Governing Law** | Jurisdiction, venue, EU provisions |
| 10 | **Termination** | Immediate right, effects, user options |
| 11 | **Changes to Terms** | 30-day notice, notification methods |
| 12 | **Contact Information** | Legal team, support, contact form |

---

## 🎯 Key Features

### Interactive Navigation
✅ **Sticky Table of Contents** - Always visible on desktop  
✅ **Active Section Highlighting** - Shows current position  
✅ **Smooth Scroll** - Click TOC item → scroll to section  
✅ **Back to Top Button** - Appears after 500px scroll

### Formatting
✅ **Bold Key Terms** - "indemnify", "warranties", "sole discretion"  
✅ **Callout Boxes** - Gray for disclaimers, amber for warnings, teal for info  
✅ **Bullet Lists** - Easy-to-scan rules and requirements  
✅ **Numbered Lists** - Step-by-step procedures

### Dark Mode
✅ **Full Support** - Proper contrast throughout  
✅ **Teal Accents** - Consistent with brand  
✅ **Gray Tones** - Optimized for readability

### Mobile Friendly
✅ **Single Column** - Stacks content vertically  
✅ **Touch Targets** - Large, easy-to-tap buttons  
✅ **Responsive Text** - Scales appropriately

---

## 🔗 Internal Links

### Within Terms Page:
- Table of Contents → Section links (smooth scroll)

### To Other Pages:
- `/privacy` - Privacy Policy
- `/help/article/community-guidelines` - Community Guidelines
- `/help` - Help Center
- `/contact` - Contact Page

### Email Links:
- `legal@lisudictionary.com` - Legal inquiries
- `support@lisudictionary.com` - General support

---

## 🎨 Color Scheme

### Light Mode:
- **Background**: White / Gray-50
- **Text**: Gray-900 / Gray-700
- **Accents**: Teal-600
- **Links**: Teal-600 (hover: underline)
- **Borders**: Gray-200

### Dark Mode:
- **Background**: Gray-800 / Gray-900
- **Text**: White / Gray-300
- **Accents**: Teal-400
- **Links**: Teal-400 (hover: underline)
- **Borders**: Gray-700

### Callout Boxes:
- **Warning**: Amber-50 / Amber-900/20
- **Info**: Teal-50 / Teal-900/20
- **Legal**: Gray-100 / Gray-700/50

---

## 📐 Typography Scale

| Element | Size | Weight |
|---------|------|--------|
| Hero Title | 4xl-5xl | Bold |
| Document Title | 3xl | Bold |
| Section Heading | 2xl | Bold |
| Subsection | lg | Semibold |
| Body Text | base-lg | Normal |
| Small Text | sm | Normal |

---

## ⚡ Performance

### Optimizations:
- Efficient scroll event handling
- Event listener cleanup
- Minimal re-renders
- Native smooth scroll behavior

### Bundle Size:
- Single component file
- Uses existing dependencies
- No additional libraries needed

---

## ♿ Accessibility

### WCAG 2.1 Features:
✅ Keyboard navigation  
✅ Screen reader friendly  
✅ Semantic HTML  
✅ Sufficient contrast  
✅ Focus indicators  
✅ Descriptive links

---

## 📱 Responsive Breakpoints

```
Mobile:   < 640px   - Single column, stacked TOC
Tablet:   640-1023px - Single column, 2-col TOC grid
Desktop:  1024px+    - Two columns, sticky sidebar
```

---

## 🔧 Customization Points

### Must Update Before Production:
1. **Line ~380**: Replace `[Your State/Country]` with actual jurisdiction
2. **Line ~386**: Replace `[Your Jurisdiction]` with venue location
3. **Line ~27**: Update `lastUpdated` date
4. **Line ~620**: Update email addresses if different
5. **Throughout**: Replace "Lisu Dictionary" if rebranding

### Optional Customizations:
- Add company address
- Include arbitration clause
- Add GDPR-specific sections
- Customize age requirements
- Add service-specific clauses

---

## 🧪 Testing Commands

```bash
# Development server
npm start

# Navigate to:
http://localhost:3000/terms
http://localhost:3000/terms-of-service

# Test checklist:
✓ Page loads without errors
✓ TOC links work
✓ Smooth scroll functioning
✓ Active section updates
✓ Back to top appears
✓ Dark mode toggle works
✓ Mobile layout correct
✓ All links functional
```

---

## 📋 Pre-Launch Checklist

Legal:
- [ ] Attorney review completed
- [ ] Jurisdiction specified
- [ ] Contact info verified
- [ ] All placeholders replaced

Technical:
- [x] Component created
- [x] Routes added
- [x] No errors in console
- [x] Mobile responsive
- [x] Dark mode working
- [ ] Footer link added
- [ ] Registration flow linked

Content:
- [x] All 12 sections complete
- [x] Introduction written
- [x] Additional provisions added
- [x] Contact section complete
- [ ] Legal team approval

---

## 🚀 Deployment Notes

### Before Going Live:
1. Legal review and approval ⚠️
2. Update last modified date
3. Verify all links work
4. Test on multiple devices
5. Add footer link to Terms
6. Link from registration page
7. Archive old version (if updating)

### Post-Launch:
1. Monitor for broken links
2. Track page views (analytics)
3. Collect user feedback
4. Plan annual review
5. Version control changes

---

## 📞 Support

### Questions About:
- **Legal Content**: Contact legal team
- **Technical Issues**: Contact dev team
- **Design Changes**: Contact UX team
- **Copy Edits**: Contact content team

---

## 📚 Related Documentation

- `TERMS_OF_SERVICE_IMPLEMENTATION.md` - Full technical docs
- `HELP_CENTER_IMPLEMENTATION.md` - Help Center docs
- Privacy Policy (when created)
- Community Guidelines article

---

## ⚠️ Legal Disclaimer

**This is a template implementation. You MUST:**
1. Have a qualified attorney review
2. Customize for your jurisdiction
3. Update for your specific services
4. Maintain current version
5. Track all changes

**Do NOT use without legal review!**

---

End of Quick Reference
