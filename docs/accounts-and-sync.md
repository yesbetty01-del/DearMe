# Accounts and offline sync

DearMe keeps journal entries, letters, replies, reflections, and attachment files on the device. The app uses Clerk for email/password accounts and Convex only to sync account data between devices. Writing and reading existing data do not require an account or network connection.

## Configure Clerk and Convex

1. Create a Clerk application with email address and password sign-in enabled. Enable email verification if you want users to verify addresses during sign-up.
2. Activate the Convex integration in Clerk. It configures the `convex` token audience expected by this app and Convex.
3. Copy the Clerk publishable key into `.env.local` as `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.
4. Set `EXPO_PUBLIC_CONVEX_URL` in `.env.local` to the Convex deployment's cloud URL. `EXPO_PUBLIC_CONVEX_SITE_URL` can remain set for other Convex tooling.
5. Copy Clerk's Frontend API URL (the issuer domain) into the same Convex deployment:

   ```sh
   npx convex env set CLERK_JWT_ISSUER_DOMAIN https://your-clerk-issuer.clerk.accounts.dev
   ```

   Use the Frontend API URL shown by Clerk for your instance, without adding a trailing slash.
6. Deploy the Convex functions and schema with `npx convex dev` (or your deployment command), then restart Expo so it reloads `.env.local`.

The first sign-in syncs this device's local writing to the account and downloads that account's writing. Changes made offline remain in SQLite and retry when the app returns to the foreground or another local change triggers sync. Signing out leaves local writing on the device. Signing in to another account switches to that account's device snapshot before syncing.

Do not commit `.env.local` or put secret keys in Expo public variables. Only Clerk's publishable key and the Convex URL belong in the app environment.
