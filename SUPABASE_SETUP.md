# Supabase Setup Guide

This guide will help you set up Supabase as the backend for your Sushi Counter app.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: sushi-counter (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the region closest to your users
4. Click **"Create new project"** and wait for it to initialize (takes ~2 minutes)

## Step 2: Run the Database Schema

1. In your Supabase dashboard, click on the **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Copy the contents of `supabase-schema.sql` from this repository
4. Paste it into the SQL Editor
5. Click **"Run"** or press `Cmd/Ctrl + Enter`
6. You should see a success message confirming the tables were created

This will create:
- `menu_items` table with default sushi rolls
- `orders` table for group orders
- `individual_orders` table for individual items
- Proper indexes and Row Level Security policies

## Step 3: Get Your API Keys

1. In your Supabase dashboard, click on **Settings** (gear icon in the left sidebar)
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (a long string starting with `eyJ...`)
4. Keep this page open - you'll need these values next

## Step 4: Configure Environment Variables

### For Local Development:

1. In the project root, create a file named `.env.local`
2. Add your Supabase credentials:

```bash
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Replace `your-project-url-here` with your **Project URL**
4. Replace `your-anon-key-here` with your **anon public** key
5. Save the file

### For Vercel Deployment:

1. Go to your Vercel dashboard
2. Navigate to your project
3. Click on **Settings** → **Environment Variables**
4. Add two variables:
   - **Name**: `VITE_SUPABASE_URL`, **Value**: your Project URL
   - **Name**: `VITE_SUPABASE_ANON_KEY`, **Value**: your anon key
5. Make sure to select **Production**, **Preview**, and **Development** for each
6. Click **Save**
7. Redeploy your app for the changes to take effect

## Step 5: Test the Connection

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Open the app** in your browser (usually `http://localhost:5173/`)

3. **Test the features**:
   - Go to Menu Editor and add/edit/delete a roll → Check if it updates
   - Create a new group order with a Venmo ID
   - Add an individual order
   - Open the same app in another browser/device with the shareable link
   - You should see the same data on both devices! 🎉

## Troubleshooting

### "Missing Supabase environment variables" Error
- Make sure `.env.local` exists in the project root
- Check that the variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your dev server after creating `.env.local`

### Data Not Syncing Across Devices
- Check your browser console for errors
- Verify your API keys are correct
- Make sure the SQL schema was executed successfully (check the Tables section in Supabase)

### "Failed to fetch" or Network Errors
- Verify your Supabase project is active (not paused)
- Check that Row Level Security policies were created (in the schema)
- Ensure your internet connection is stable

## Database Structure

### Tables

**menu_items**
- `id` (UUID, primary key)
- `name` (text)
- `description` (text, optional)
- `image` (text, optional)
- `created_at`, `updated_at` (timestamps)

**orders**
- `id` (UUID, primary key)
- `date` (text, format: YYYY-MM-DD)
- `venmo_id` (text)
- `status` (text: 'active' or 'completed')
- `created_at`, `updated_at` (timestamps)

**individual_orders**
- `id` (UUID, primary key)
- `order_id` (UUID, foreign key → orders)
- `name` (text)
- `three_roll_combo` (text array, optional)
- `single_roll` (text, optional)
- `beverage` (text, optional)
- `miso_soup` (boolean)
- `total` (numeric)
- `packaged` (boolean)
- `paid` (boolean)
- `created_at`, `updated_at` (timestamps)

## Real-time Features

The app uses Supabase's real-time subscriptions to automatically sync data across all connected devices:

- When someone adds/edits/deletes a menu item, all users see the update instantly
- When someone places an order, it appears immediately for the organizer
- When the organizer marks items as packaged/paid, everyone sees the updates

## Security

The current setup uses public Row Level Security policies, meaning anyone with the link can:
- View and edit menu items
- Create and view orders
- Update order statuses

This is appropriate for a collaborative group ordering app where trust is assumed. If you need more security, you can modify the RLS policies in the Supabase dashboard.

## Next Steps

- **Custom Domain**: Set up a custom domain in Vercel settings
- **Improve Security**: Add authentication if needed
- **Add Analytics**: Track order patterns and popular items
- **Email Notifications**: Send order confirmations via Supabase Edge Functions

## Support

If you encounter any issues, check:
1. Supabase Dashboard → Logs (for database errors)
2. Browser Console (for client-side errors)
3. Vercel Logs (for deployment errors)

