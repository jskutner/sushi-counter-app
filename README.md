# 🍣 Sushi Counter - Group Order Coordinator

A web application for coordinating group sushi orders from Sushi Counter restaurant. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Create Group Orders**: Generate unique shareable links for order sessions
- **Individual Order Submission**: Easy-to-use form for participants to submit their orders
- **Order Management**: Track packaging status and view all orders in one place
- **Payment Tracking**: Monitor who has paid and collect Venmo payments
- **Order History**: View past completed orders
- **Menu Management**: Add, edit, and remove menu items with descriptions and images
- **Public Menu Display**: Showcase all available sushi rolls with pricing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd sushi-counter-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is busy).

### Building for Production

To create a production build:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage Guide

### For Organizers

1. **Create an Order**:
   - Click "Create Order" on the home page
   - Copy the shareable link and send it to your group

2. **Manage Orders**:
   - View all submitted orders in the management view
   - Mark items as packaged when picking up from restaurant
   - Print the order list for easy reference

3. **Track Payments**:
   - Navigate to Payment Tracking
   - Mark participants as paid when they send Venmo
   - Monitor outstanding balances

4. **Edit Menu** (Optional):
   - Go to Menu Editor from the home page
   - Add/edit/delete sushi roll options
   - Upload images and descriptions

### For Participants

1. Click the shared order link
2. Fill out the form:
   - Enter your name (required)
   - Add your Venmo ID (optional but recommended)
   - Select 3-Roll Combo and/or Single Roll
   - Choose optional beverages and miso soup
3. Review your total and submit
4. Send payment to the organizer via Venmo

## Pricing

- **3-Roll Combo**: $12 (choose any 3 rolls)
- **Single Roll**: $5
- **Beverages**: $3 (Matcha lemonade, Yuzu lemonade, Lemon lime & bitters)
- **Miso Soup**: $2

## Technical Details

### Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **LocalStorage** for data persistence

### Project Structure

```
src/
├── context/
│   └── AppContext.tsx       # Global state management
├── pages/
│   ├── Home.tsx            # Landing page
│   ├── OrderForm.tsx       # Individual order submission
│   ├── OrderManagement.tsx # Order tracking and packaging
│   ├── PaymentTracking.tsx # Payment status
│   ├── OrderHistory.tsx    # Past orders view
│   ├── MenuDisplay.tsx     # Public menu
│   └── MenuEditor.tsx      # Menu management
├── types.ts                # TypeScript interfaces
├── App.tsx                 # Main app with routing
└── main.tsx               # Entry point
```

### Data Storage

All data is stored in browser LocalStorage:
- `sushi-counter-orders`: Order data
- `sushi-counter-menu-items`: Menu items

**Note**: Data is stored locally in the browser. Clearing browser data will delete all orders. For production use with real-time sync, consider integrating Firebase or Supabase.

## Customization

### Updating Prices

Edit the `PRICES` object in `src/types.ts`:

```typescript
export const PRICES = {
  THREE_ROLL_COMBO: 12,
  SINGLE_ROLL: 5,
  BEVERAGE: 3,
  MISO_SOUP: 2
};
```

### Modifying Default Menu

Edit the `DEFAULT_MENU_ITEMS` array in `src/context/AppContext.tsx`.

### Styling

The app uses Tailwind CSS. Customize colors and styles in `tailwind.config.js` or directly in component classes.

## Browser Support

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Potential features for future versions:
- Cloud storage (Firebase/Supabase) for data persistence
- Real-time updates for collaborative ordering
- Email/SMS notifications
- QR code generation for easy link sharing
- Export orders to CSV/PDF
- Multiple restaurant support
- User authentication

## License

This project is open source and available for personal and commercial use.

## Support

For issues or questions, please create an issue in the repository.
