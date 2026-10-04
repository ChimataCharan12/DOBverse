<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Keep DOBverse's imported TanStack routes, local birth/person stores, and theme preference system as the source of truth; preserving saved data and calculations avoids regression.
- Keep the birthday card's editable state and saved designs local in the browser; photos and birth dates must not be sent to a backend.
