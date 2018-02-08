#!/usr/bin/env bash
set -eo pipefail

prelude() {
  echo "
You have prettier linting errors!
----------------------------------
The following files would turn out different if you process them with prettier.

"
}

any=false
first=true
while read line
do
  $first && prelude
  echo "To fix:"
  echo "    prettier --write ${line}"
  echo "To see:"
  echo "    prettier ${line} | diff ${line} -"
  echo ""
  # echo "$line"
  any=true
  first=false
done < "${1:-/dev/stdin}"


$any && echo "
If you're not interested in how they're different, consider running:

  yarn run lint-fix
"

$any && exit 1 || exit 0
