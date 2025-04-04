# Budgetify - Personal Finance Management App

A modern, responsive personal finance management application built with React and TypeScript.

## Features

- 📊 Interactive financial dashboards and charts
- 💰 Expense tracking and budgeting
- 📱 Fully responsive design for all devices
- 🌙 Dark/Light mode support
- 🔒 Secure authentication with Supabase
- 📈 Real-time data updates
- 🎨 Modern UI with shadcn/ui components

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (based on Radix UI)
- **State Management**: React Query
- **Form Handling**: React Hook Form with Zod validation
- **Backend**: Supabase
- **Charts**: Recharts
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Date Handling**: date-fns

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/       # React context providers
├── hooks/         # Custom React hooks
├── integrations/  # Third-party integrations
├── lib/          # Utility libraries
├── pages/        # Page components
├── services/     # API and service functions
├── types/        # TypeScript type definitions
└── utils/        # Helper functions
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd budgetify-responsive
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

The project can be deployed using various platforms:

1. **Vercel** (Recommended)
   - Connect your GitHub repository
   - Configure environment variables
   - Deploy with one click

2. **Netlify**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Configure environment variables

3. **GitHub Pages**
   - Add `base` configuration in `vite.config.ts`
   - Set build command: `npm run build`
   - Deploy using GitHub Actions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
