python3 -c "
import re, pathlib
f = pathlib.Path('index.html')
old = f.read_text()
new_fn = '''window.submitCommunityComment = async function(event) {
  event.preventDefault();
  if (!currentCommunityRecipe || !currentUser) return;
  const input = document.getElementById(\'communityCommentInput\');
  const text = input.value.trim();
  if (!text) return;
  // Add instantly to local list
  input.value = \'\';
  currentCommunityComments.push({
    authorName: currentUser.displayName || \'Pear User\',
    authorEmail: currentUser.email || \'\',
    text
  });
  currentCommunityCommentsVisible = currentCommunityComments.length;
  renderCommunityComments();
  // Save to Firestore in background
  addDoc(communityCommentsCol(), {
    communityRecipeId: currentCommunityRecipe._docId,
    authorUid: currentUser.uid,
    authorName: currentUser.displayName || \'Pear User\',
    authorEmail: currentUser.email || \'\',
    text,
    createdAt: serverTimestamp()
  });
  updateDoc(doc(db, \"communityRecipes\", currentCommunityRecipe._docId), { commentCount: increment(1) });
  currentCommunityRecipe.commentCount = (currentCommunityRecipe.commentCount || 0) + 1;
  document.getElementById(\'communityCommentCount\').textContent = currentCommunityRecipe.commentCount;
  allCommunityRecipes = allCommunityRecipes.map(r => r._docId === currentCommunityRecipe._docId ? { ...r, commentCount: currentCommunityRecipe.commentCount } : r);
  renderCommunityGrid(filterCommunityRecipes(allCommunityRecipes));
};'''
result = re.sub(r'window\.submitCommunityComment = async function\(event\).*?\};', new_fn, old, flags=re.DOTALL)
f.write_text(result)
print('Done' if result != old else 'NO MATCH FOUND')
"
