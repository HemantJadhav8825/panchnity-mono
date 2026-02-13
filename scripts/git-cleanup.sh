#!/bin/bash
set -e

# Define protected branches
PROTECTED_BRANCHES="main|dev|prod|stage|uat"

echo "Deleting all local branches except: $PROTECTED_BRANCHES..."
# List branches, filter out current branch (*) and protected branches, and delete them
git branch | grep -Ev "^\*|($PROTECTED_BRANCHES)$" | xargs git branch -D || echo "No other branches to delete."

echo "Git branch cleanup complete!"
