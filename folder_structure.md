# Sportify Hub: Folder Structure

This structure is designed for a React Native (Expo) application following clean architecture and feature-based separation.

```text
sportify-hub/
│
├── App.tsx                    # Entry point of the application
├── app.json                   # Expo configuration
├── package.json               # Dependencies and scripts
│
├── src/
│   ├── assets/                # Static assets
│   │   ├── fonts/             # Custom fonts (Poppins, Inter)
│   │   ├── images/            # Local images
│   │   └── lottie/            # Animation files (JSON)
│   │
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # Base UI elements (Button, Input, Card)
│   │   │   ├── GlassCard.tsx  # Glassmorphism container
│   │   │   ├── GradientButton.tsx
│   │   │   └── Typography.tsx
│   │   ├── venue/             # Venue-specific components (VenueCard, SlotPicker)
│   │   ├── social/            # Social components (PlayerAvatar, MatchCard)
│   │   └── Layout.tsx         # Standard screen wrapper
│   │
│   ├── navigation/            # React Navigation setup
│   │   ├── RootNavigator.tsx
│   │   ├── AuthStack.tsx      # Login/Signup flow
│   │   └── MainTabNavigator.tsx # Bottom tabs (Home, Explore, Play, Activity, Profile)
│   │
│   ├── screens/               # Screen-level components
│   │   ├── auth/              # LoginScreen, SignupScreen, OnboardingScreen
│   │   ├── home/              # HomeScreen (Dashboard)
│   │   ├── explore/           # VenueListScreen, VenueDetailsScreen, BookingCalendarScreen
│   │   ├── play/              # MatchmakingScreen, CreateMatchScreen, ChatRoomScreen
│   │   ├── activity/          # ActivityDashboardScreen, LeaderboardScreen
│   │   └── profile/           # UserProfileScreen, SettingsScreen
│   │
│   ├── services/              # External integrations
│   │   ├── api.ts             # Axios instance and interceptors
│   │   ├── authService.ts     # Login/Token management
│   │   ├── bookingService.ts  # Booking API calls
│   │   ├── socket.ts          # WebSocket/Socket.io client for real-time chat/availability
│   │   └── paymentService.ts  # Stripe/Razorpay integration
│   │
│   ├── store/                 # Global state management (Zustand or Redux)
│   │   ├── useAuthStore.ts
│   │   ├── useLocationStore.ts
│   │   └── useBookingStore.ts
│   │
│   ├── theme/                 # Design system
│   │   ├── colors.ts          # Deep Purple, Neon Blue, Electric Cyan
│   │   ├── typography.ts      # Font families and sizes
│   │   ├── spacing.ts         # Margins and paddings
│   │   └── glassmorphism.ts   # Shared styles for glass UI
│   │
│   ├── utils/                 # Helper functions
│   │   ├── dateUtils.ts       # Formatting dates (date-fns/moment)
│   │   └── validation.ts      # Form validation schemas (Yup/Zod)
│   │
│   └── types/                 # TypeScript interfaces and types
│       ├── user.d.ts
│       ├── venue.d.ts
│       └── navigation.d.ts
```
