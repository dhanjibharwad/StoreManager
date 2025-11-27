# Service Platform

A modern service platform built with Next.js and TailwindCSS featuring complaint management and user support services.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deployment to Netlify

### Option 1: Deploy with Netlify UI

1. Push your code to a GitHub, GitLab, or Bitbucket repository
2. Log in to [Netlify](https://app.netlify.com/)
3. Click "New site from Git"
4. Select your Git provider and repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Click "Deploy site"

### Option 2: Deploy with Netlify CLI

1. Install Netlify CLI globally:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to your Netlify account:
   ```bash
   netlify login
   ```

3. Initialize Netlify in your project:
   ```bash
   netlify init
   ```

4. Follow the prompts to configure your site settings

5. Deploy your site:
   ```bash
   netlify deploy --prod
   ```

## Environment Variables

If your application uses environment variables, make sure to configure them in the Netlify dashboard:

1. Go to Site settings > Build & deploy > Environment
2. Add your environment variables

## Custom Domain

To set up a custom domain:

1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the instructions to configure your DNS settings

## Troubleshooting

If you encounter any issues during deployment:

1. Check Netlify build logs for errors
2. Ensure the `@netlify/plugin-nextjs` plugin is installed
3. Verify your Next.js version is compatible with Netlify

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server locally
npm run start
```

## User Roles

The application supports different user roles:
- `user`: Regular user (default)
- `superadmin`: Super administrator with full access

To add the role column to your database, run the SQL script:

```sql
-- Execute the src/lib/add-role-column.sql file in your Supabase SQL editor
```

You can then update user roles directly in the database table:

```sql
-- Example: Set a user as superadmin
UPDATE users SET role = 'superadmin' WHERE email = 'admin@example.com';
```

## Complaint System

The application includes a comprehensive complaint system with the following features:

### Features
- **Auto-populated email** from authenticated user
- **Phone number field** for better contact information
- **File upload support** for images and videos (up to 5 files, 10MB each)
- **Drag-and-drop file upload** with preview
- **Form validation** with proper error handling
- **Secure file storage** using Supabase Storage

### Setup
1. Run the complaints schema SQL script:
   ```sql
   -- Execute src/lib/complaints-schema.sql in Supabase SQL editor
   ```

2. Create storage bucket for file uploads:
   ```sql
   INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);
   ```

3. Set up storage policies for secure file access

### Usage
- Users can submit complaints at `/user/complaint`
- Email is automatically fetched from their authenticated session
- Files are uploaded to Supabase Storage and URLs stored in database
- Complaints can be viewed and managed through the admin interface

For detailed setup instructions, see `COMPLAINT_SETUP.md`.
