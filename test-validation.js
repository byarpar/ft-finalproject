const validateRegisterPassword = (value) => {
  if (!value || !value.trim()) {
    return 'Password required';
  }
  if (value.length < 8) {
    return 'Minimum 8 characters';
  }
  if (value.length > 128) {
    return 'Maximum 128 characters';
  }
  // Check for uppercase, lowercase, number, and special character
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_#])/.test(value)) {
    return 'Must include uppercase, lowercase, number, and special character (@$!%*?&-_#)';
  }
  return '';
};

console.log('Testing passwords:');
console.log('Byarpar199812 =>', validateRegisterPassword('Byarpar199812') || 'Valid ✓');
console.log('Byarpar199812@ =>', validateRegisterPassword('Byarpar199812@') || 'Valid ✓');
console.log('Byarpar199812! =>', validateRegisterPassword('Byarpar199812!') || 'Valid ✓');
console.log('byarpar199812@ =>', validateRegisterPassword('byarpar199812@') || 'Valid ✓');
console.log('BYARPAR199812@ =>', validateRegisterPassword('BYARPAR199812@') || 'Valid ✓');
console.log('Test123 =>', validateRegisterPassword('Test123') || 'Valid ✓');
console.log('Test123@ =>', validateRegisterPassword('Test123@') || 'Valid ✓');
