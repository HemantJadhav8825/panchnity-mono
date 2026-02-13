#!/bin/bash
set -e

# Define protected branches
PROTECTED_BRANCHES="main|dev|prod|stage|uat"

echo "Fetching latest remote branches..."
git fetch origin --prune

echo "Identifying remote branches to delete (excluding: main, dev, prod, stage, uat)..."

# 1. git branch -r: List remote branches
# 2. grep -v "origin/HEAD": Filter out the HEAD pointer
# 3. grep -Ev "origin/($PROTECTED_BRANCHES)$": Filter out protected branches (exact match)
# 4. sed 's/origin\///': Remove 'origin/' prefix for the delete command
BRANCHES_TO_DELETE=$(git branch -r | grep -v "origin/HEAD" | grep -Ev "origin/($PROTECTED_BRANCHES)$" | sed 's/  origin\///')

if [ -z "$BRANCHES_TO_DELETE" ]; then
    echo "No remote branches found for deletion."
    exit 0
fi

echo "The following remote branches will be DELETED:"
echo "$BRANCHES_TO_DELETE"
echo ""

# Use a loop to delete branches one by one
for branch in $BRANCHES_TO_DELETE; do
    echo "Deleting remote branch: $branch"
    git push origin --delete "$branch" || echo "Failed to delete $branch (might already be gone)"
done

echo "Remote Git branch cleanup complete!"
