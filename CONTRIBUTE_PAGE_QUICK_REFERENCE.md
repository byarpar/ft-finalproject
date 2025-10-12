# Contribute Page - Quick Reference Guide

Quick lookup guide for the Contribute page features and implementation.

---

## 📍 Page Location

- **URL**: `/contribute`
- **Component**: `src/pages/Contribute.js`
- **Size**: 1,200+ lines
- **Route**: Public (no login required)

---

## 🎯 4 Contribution Types

### 1️⃣ Suggest a New Word
**Icon**: Pencil (Amber/Orange gradient)  
**Required**:
- Lisu word
- English translation(s)
- Part of speech

**Optional**:
- Example sentences (Lisu + English)
- Pronunciation notes
- Audio file
- Source/reference

### 2️⃣ Improve a Definition
**Icon**: Chat Bubbles (Blue/Cyan gradient)  
**Required**:
- Search for word
- Improved definition

**Optional**:
- Reason for improvement

**Features**:
- Shows current definition
- Search button

### 3️⃣ Add Pronunciation Audio
**Icon**: Microphone (Green/Emerald gradient)  
**Required**:
- Search for word
- Audio file (MP3, WAV, OGG)

**Features**:
- Large upload area
- Recording tips callout
- File validation
- Max 10MB

### 4️⃣ Join Our Moderators
**Icon**: User Group (Purple/Pink gradient)  
**Required**:
- Motivation statement

**Optional**:
- Relevant experience
- Time availability

**Features**:
- Moderator responsibilities listed
- 3-5 hours/week commitment

---

## 📋 Parts of Speech Options

1. Noun
2. Verb
3. Adjective
4. Adverb
5. Pronoun
6. Preposition
7. Conjunction
8. Interjection
9. Particle
10. Phrase
11. Idiom

---

## 🎨 Page Structure

### Hero Section
- **Title**: "Empower the Lisu Language"
- **Subtitle**: "Your Knowledge, Your Legacy"
- **Impact**: "Every contribution helps thousands"
- **Layout**: 2 columns (text + image)
- **Cards**: 4 contribution types

### Main Content (2 Columns)

#### Left (40%)
1. **Contribution Guidelines**
   - Be Accurate
   - Provide Examples
   - Use Respectful Language
   - Review Existing Entries
   - Link to full guidelines

2. **Meet Our Contributors**
   - 5 featured contributors
   - Avatar + contribution count
   - Impact statement
   - Link to all contributors

#### Right (60%)
- **Dynamic Submission Form**
- Changes based on active card
- Success/error messages
- Submit button

---

## ✅ Validation Rules

### New Word Form
- ✅ Lisu word: Required
- ✅ English translation: Required
- ✅ Part of speech: Required
- ✅ Audio file: Optional, but if provided:
  - Type: MP3, WAV, OGG only
  - Size: Max 10MB

### Improve Definition
- ✅ Search word: Required
- ✅ Improved definition: Required

### Add Audio
- ✅ Search word: Required
- ✅ Audio file: Required
  - Type: MP3, WAV, OGG only
  - Size: Max 10MB

### Moderator Application
- ✅ Motivation: Required

---

## 🎨 Design Features

### Colors
**Card Gradients**:
- Amber: from-amber-500 to-orange-500
- Blue: from-blue-500 to-cyan-500
- Green: from-green-500 to-emerald-500
- Purple: from-purple-500 to-pink-500

**Callout Boxes**:
- Teal: Impact, general info
- Blue: Recording tips
- Green: Success messages
- Red: Error messages
- Purple: Moderator info
- Gray: Current definition

### Interactive
- **Hover**: Scale to 105%, shadow
- **Active**: Ring highlight (white, 4px)
- **Scroll**: Smooth to form (100px offset)
- **Validation**: Real-time inline errors
- **Success**: Auto-dismiss after 3 seconds

---

## 📱 Responsive Breakpoints

### Desktop (1024px+)
- 2-column layout (40/60)
- 4-column cards
- Side-by-side hero
- Featured image visible

### Tablet (640-1023px)
- Single column layout
- 2-column cards
- Stacked hero

### Mobile (< 640px)
- Single column throughout
- Stacked cards
- Compact forms
- Touch-optimized

---

## 🔗 Internal Links

### From This Page
- **Read Full Guidelines** → `/help/article/contribution-guidelines`
- **View All Contributors** → `/members`

### To This Page (Suggested)
- Navbar: "Contribute" menu item
- Footer: "Contribute" link
- Home: CTA button
- Word pages: "Add audio" / "Improve" buttons
- Dictionary: "Suggest new word" link

---

## 📊 Featured Contributors

**Sample Structure**:
```javascript
{
  id: 1,
  name: 'Sarah Chen',
  avatar: 'SC',
  contributions: 245
}
```

**Display**:
- Circular avatar (gradient bg)
- Initials in white
- Contribution count below
- Hover tooltip with name

**Currently**: 5 featured contributors shown

---

## 🔧 Form Behavior

### Card Click
1. Set active tab
2. Clear form data
3. Clear errors
4. Smooth scroll to form

### Input Change
1. Update form data
2. Clear field error
3. Enable submit button

### File Upload
1. Validate file type
2. Validate file size
3. Show filename
4. Show error if invalid

### Submit
1. Run validation
2. Show errors if invalid
3. Submit to backend (when integrated)
4. Show success message
5. Reset form after 3 seconds

---

## 🎯 User Flow

**Step 1**: Land on page  
↓  
**Step 2**: Read hero + guidelines  
↓  
**Step 3**: Click contribution card  
↓  
**Step 4**: Scroll to form  
↓  
**Step 5**: Fill out form  
↓  
**Step 6**: Submit  
↓  
**Step 7**: See success message  
↓  
**Step 8**: Form resets (or submit another)

---

## 🌗 Dark Mode

✅ Full support with:
- Gray-900 backgrounds
- Gray-800 cards
- Gray-700 inputs
- Adjusted borders
- Proper text contrast
- Callout box variants
- Icon color adaptation

---

## ♿ Accessibility

✅ **Form Labels**: All inputs labeled  
✅ **Required Indicators**: Red asterisks  
✅ **Error Messages**: Icon + text  
✅ **Keyboard Nav**: Full support  
✅ **Focus States**: Visible rings  
✅ **Screen Readers**: Semantic HTML  
✅ **Color Contrast**: WCAG 2.1 AA

---

## 📊 State Management

**activeTab**: Current contribution type  
- 'new-word'
- 'improve-definition'
- 'add-audio'
- 'moderator'

**formData**: Object with all field values  
**searchWord**: Word search query  
**submitted**: Boolean success state  
**errors**: Object with field error messages

---

## 🔌 Backend Integration (To Do)

### API Endpoints Needed

**POST /api/contributions/words**  
Submit new word

**POST /api/contributions/improvements**  
Submit definition improvement

**POST /api/contributions/audio**  
Submit audio file

**POST /api/contributions/moderator-application**  
Submit moderator application

**GET /api/words/search?q={term}**  
Search for words

**GET /api/contributors/featured**  
Get featured contributors

---

## 🚀 Quick Tips

### For Users
- Read guidelines before contributing
- Use examples to provide context
- Check for duplicates first
- Keep audio recordings clear and short
- Be patient - reviews take time

### For Developers
- Form validation runs client-side
- File upload needs backend endpoint
- Success state auto-resets
- Dark mode fully supported
- Mobile-first responsive

### For Admins
- Set up review workflow
- Create email templates
- Configure file storage
- Define approval criteria
- Set response time goals

---

## 📈 Metrics to Track

### Engagement
- Page visits
- Card click rates
- Form starts
- Form completions
- Abandonment rate

### Contributions
- New words submitted
- Improvements submitted
- Audio uploads
- Moderator applications
- Approval rate

### Quality
- Review time
- Rejection rate
- User feedback
- Return rate

---

## ⚠️ Important Notes

**Current Status**: Frontend complete  
**Backend**: Not yet integrated  
**Search**: Mock functionality  
**Contributors**: Sample data  
**File Upload**: Validates but doesn't save yet

**Before Launch**:
- [ ] Integrate with backend API
- [ ] Set up file storage (S3/Cloudinary)
- [ ] Create admin review interface
- [ ] Add email notifications
- [ ] Create Help Center articles
- [ ] Test thoroughly
- [ ] Add featured image

---

## 🎓 Code Reference

### Import
```javascript
import Contribute from './pages/Contribute';
```

### Route
```javascript
<Route path="/contribute" element={<Contribute />} />
```

### Navigation
```javascript
<Link to="/contribute">Contribute</Link>
```

### With Parameters (Future)
```javascript
<Link to="/contribute?type=add-audio">
  Add Audio
</Link>
```

---

## 📚 Related Pages

- **Help Center**: Guidelines article
- **Members**: All contributors
- **Dashboard**: User contributions
- **Word Detail**: "Improve this" link
- **Dictionary**: "Add new word" CTA

---

## 🎉 Quick Stats

- **Component**: 1,200+ lines
- **Forms**: 4 types
- **Fields**: 20+ total
- **Validation Rules**: 10+
- **Callout Boxes**: 6 types
- **Icons**: 9 unique
- **Links**: 2 internal
- **Responsive**: 3 breakpoints
- **Dark Mode**: ✅ Full support

---

## 📞 Need Help?

**Implementation Questions**:
- See CONTRIBUTE_PAGE_IMPLEMENTATION.md
- Check code comments in Contribute.js
- Review validation logic

**User Questions**:
- Link to Help Center
- Contribution guidelines article
- Contact support

---

**Last Updated**: January 15, 2025  
**Version**: 1.0.0  
**Status**: Frontend Complete
