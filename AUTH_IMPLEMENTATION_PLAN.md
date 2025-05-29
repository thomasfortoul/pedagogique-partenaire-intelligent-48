# Detailed Plan for User Authentication Implementation

**Goal:** Integrate Supabase user authentication into the current Next.js project, leveraging the existing `sample-platfor` application's authentication logic and UI components.

### Summary of User Preferences:

*   **Current Project Framework:** Next.js
*   **Backend for Authentication:** Supabase.
*   **API Endpoints:** Create new API routes under `src` in the root, mirroring the structure in `sample-platfor/app/api/auth/`. This means the new API routes will be something like `src/api/auth/signin/route.ts`.
*   **User Interface (UI) Integration:** Modify existing pages: `src/pages/Login.tsx` and `src/pages/Register.tsx`.
*   **State Management:** Adapt the `AuthContext` and `useAuth` hook from `sample-platfor`.
*   **Environment Variables:** The Supabase environment variables are already available in the `.env` file at the root (`./.env`).

---

### Phase 1: Setup and Core Utilities

1.  **Install Supabase Dependencies:**
    *   Add `@supabase/supabase-js` and `@supabase/ssr` to the current project's `package.json`.
    *   Install dependencies (e.g., by running `npm install` or `yarn add`).
2.  **Create Supabase Utility File:**
    *   Create a new file: `src/lib/auth/supabase-utils.ts`.
    *   Copy the content from `sample-platfor/lib/auth/supabase-utils.ts` into this new file. This will provide the `createSupabaseServerClient` and `createBrowserClient` functions.
3.  **Create Auth Context:**
    *   Create a new file: `src/lib/auth/auth-context.tsx`.
    *   Copy the content from `sample-platfor/lib/auth/auth-context.tsx` into this new file. This will provide the `AuthProvider` and `useAuth` hook.
4.  **Configure `tsconfig.json`:**
    *   Ensure the `tsconfig.json` in the current project has the `@/` path alias configured to point to the `src` directory, similar to how `sample-platfor` handles it. This is crucial for resolving imports like `@/lib/auth/auth-context`.

---

### Phase 2: API Routes

1.  **Create API Route Directory Structure:**
    *   Create the directory: `src/api/auth/signin`.
    *   Create the directory: `src/api/auth/signup`.
2.  **Create Sign-in API Route:**
    *   Create a new file: `src/api/auth/signin/route.ts`.
    *   Copy the content from `sample-platfor/app/api/auth/signin/route.ts` into this new file.
    *   Adjust import paths if necessary (e.g., `@/lib/auth/supabase-utils` should resolve correctly if `tsconfig.json` is configured).
3.  **Create Sign-up API Route:**
    *   Create a new file: `src/api/auth/signup/route.ts`.
    *   Copy the content from `sample-platfor/app/api/auth/signup/route.ts` into this new file.
    *   Adjust import paths if necessary.

---

### Phase 3: UI Integration

1.  **Modify `src/pages/Login.tsx`:**
    *   Integrate the login form logic from `sample-platfor/app/auth/login/page.tsx`. This will involve:
        *   Importing `useAuth` from `src/lib/auth/auth-context`.
        *   Using `useState` for email, password, loading, and error states.
        *   Implementing the `handleSubmit` function to call `signIn` from `useAuth`.
        *   Adding UI elements for error display and loading states.
        *   Ensuring proper routing after successful login (e.g., to `/dashboard` or a relevant page in the current project).
        *   Adding a link to the registration page.
2.  **Modify `src/pages/Register.tsx`:**
    *   Integrate the signup form logic, similar to the login page, using the `signUp` function from `useAuth`.
    *   Add UI elements for error display and loading states.
    *   Ensure proper routing after successful registration (e.g., to `/login` or a confirmation page).
    *   Adding a link to the login page.
3.  **Wrap Application with `AuthProvider`:**
    *   Locate the root layout file of the current Next.js project (likely `src/App.tsx` or `src/layout.tsx`).
    *   Wrap the main application content with the `AuthProvider` component imported from `src/lib/auth/auth-context.tsx`. This will make the authentication context available throughout the application.

---

### Phase 4: Routing and Protection (Conceptual)

1.  **Implement Route Protection:**
    *   This phase will involve creating a higher-order component (HOC) or using Next.js middleware to protect routes that require authentication. This will be discussed and implemented in the next phase.
2.  **Logout Functionality:**
    *   Integrate a logout button/link in the UI (e.g., in `src/components/NavBar.tsx` or a dashboard page) that calls the `signOut` function from `useAuth`.

---

### Mermaid Diagram for Authentication Flow:

```mermaid
graph TD
    A[User] --> B(Access Protected Route / Login Page)
    B -- If not authenticated --> C{Is AuthProvider wrapped?}
    C -- No --> D[Error: AuthProvider missing]
    C -- Yes --> E[AuthContext provides user/session]

    E -- User enters credentials --> F[Login/Register Page (src/pages/Login.tsx / src/pages/Register.tsx)]
    F -- Calls signIn/signUp from useAuth --> G[useAuth Hook (src/lib/auth/auth-context.tsx)]
    G -- Calls Supabase auth methods --> H[Supabase Client (src/lib/auth/supabase-utils.ts)]
    H -- Makes API call to Supabase --> I[Supabase Backend]

    I -- Supabase responds with session/error --> H
    H -- Updates AuthContext state --> G
    G -- Updates UI via useAuth --> F
    F -- On successful login/signup --> J[Redirect to Dashboard / Protected Route]

    J -- Accesses protected data --> K[Protected Component]
    K -- Uses useAuth to check user status --> G
    G -- If authenticated --> L[Render Protected Content]
    G -- If not authenticated --> M[Redirect to Login]

    N[Logout Button] --> G
    G -- Calls signOut --> H
    H -- Clears session --> G
    G -- Updates UI --> F[Redirect to Login/Home]
```

### Mermaid Diagram for File Structure:

```mermaid
graph TD
    A[Current Project Root] --> B[src/]
    B --> C[src/api/]
    C --> D[src/api/auth/]
    D --> E[src/api/auth/signin/route.ts]
    D --> F[src/api/auth/signup/route.ts]

    B --> G[src/lib/]
    G --> H[src/lib/auth/]
    H --> I[src/lib/auth/supabase-utils.ts]
    H --> J[src/lib/auth/auth-context.tsx]

    B --> K[src/pages/]
    K --> L[src/pages/Login.tsx]
    K --> M[src/pages/Register.tsx]
    K --> N[src/App.tsx (or root layout)]

    N -- Imports and uses --> J
    L -- Imports and uses --> J
    M -- Imports and uses --> J
    E -- Imports and uses --> I
    F -- Imports and uses --> I