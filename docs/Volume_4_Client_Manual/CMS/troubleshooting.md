# CMS Troubleshooting

## Common Issues

### Can't Login

**Problem**: GitHub login fails or redirects incorrectly

**Solutions**:
1. Check GitHub OAuth configuration
2. Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set
3. Check OAuth redirect URL matches
4. Clear browser cache and cookies
5. Try incognito/private mode

### Changes Not Saving

**Problem**: Edits don't save or disappear

**Solutions**:
1. Check Git repository permissions
2. Verify GitHub access token is valid
3. Check for Git errors in browser console
4. Ensure you have write access to repository
5. Try refreshing and saving again

### Images Not Uploading

**Problem**: Image upload fails or doesn't appear

**Solutions**:
1. Check file size (should be under 10MB)
2. Verify file format (JPG, PNG, GIF)
3. Check file permissions
4. Verify media folder exists
5. Check browser console for errors

### Preview Not Working

**Problem**: Preview shows error or blank page

**Solutions**:
1. Check if content is valid JSON
2. Verify all required fields are filled
3. Check for syntax errors
4. Try saving and previewing again
5. Check browser console for errors

### Content Not Appearing on Site

**Problem**: Published content doesn't show on website

**Solutions**:
1. Verify content was published (not draft)
2. Check if site needs rebuild
3. Verify JSON file was updated in Git
4. Check Next.js revalidation
5. Clear site cache if applicable

## Getting Help

If issues persist:
1. Check Git repository for errors
2. Review browser console
3. Check server logs
4. Contact administrator
5. Review [Editing Guide](./editing.md)
